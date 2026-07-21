import { postgresService } from "./postgres.service.js";
import logger from "../middlewares/logger.js";

/**
 * Service for Identity & Votes CRUD operations against PostgreSQL.
 * Reuses the connection pool from PostgresService.
 */
export class IdentityVotesService {
  // ── Identity ───────────────────────────────────────────────────

  /**
   * Retrieves the identity declaration text for a given user.
   */
  async getIdentity(username: string): Promise<string> {
    const pool = postgresService.getPool();
    if (!pool) return "";

    try {
      const result = await pool.query(
        "SELECT identity_text FROM user_identity WHERE username = $1",
        [username]
      );
      return result.rows[0]?.identity_text ?? "";
    } catch (error) {
      logger.error({ err: error, username }, "Failed to get identity");
      throw error;
    }
  }

  /**
   * Upserts the identity declaration text for a given user.
   * Uses INSERT ... ON CONFLICT to handle both create and update.
   */
  async saveIdentity(username: string, identityText: string): Promise<void> {
    const pool = postgresService.getPool();
    if (!pool) return;

    try {
      await pool.query(
        `INSERT INTO user_identity (username, identity_text, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (username)
         DO UPDATE SET identity_text = EXCLUDED.identity_text,
                       updated_at = NOW()`,
        [username, identityText]
      );
    } catch (error) {
      logger.error({ err: error, username }, "Failed to save identity");
      throw error;
    }
  }

  // ── Votes ──────────────────────────────────────────────────────

  /**
   * Retrieves all votes for a user, each with its full vote history.
   * Returns data shaped for the frontend: { id, name, history: string[] }
   */
  async getVotes(
    username: string
  ): Promise<{ id: string; name: string; history: string[] }[]> {
    const pool = postgresService.getPool();
    if (!pool) return [];

    try {
      const result = await pool.query(
        `SELECT v.id, v.name,
                COALESCE(
                  array_agg(vh.vote_date::text ORDER BY vh.vote_date DESC)
                  FILTER (WHERE vh.vote_date IS NOT NULL),
                  '{}'
                ) AS history
         FROM user_votes v
         LEFT JOIN vote_history vh ON vh.vote_id = v.id
         WHERE v.username = $1
         GROUP BY v.id, v.name
         ORDER BY v.created_at ASC`,
        [username]
      );
      return result.rows;
    } catch (error) {
      logger.error({ err: error, username }, "Failed to get votes");
      throw error;
    }
  }

  /**
   * Creates a new vote (habit) for the given user.
   * Returns the newly created vote record.
   */
  async addVote(
    username: string,
    name: string
  ): Promise<{ id: string; name: string; history: string[] }> {
    const pool = postgresService.getPool();
    if (!pool) throw new Error("PostgreSQL is not enabled");

    try {
      const result = await pool.query(
        `INSERT INTO user_votes (username, name)
         VALUES ($1, $2)
         RETURNING id, name`,
        [username, name]
      );
      return { ...result.rows[0], history: [] };
    } catch (error) {
      logger.error({ err: error, username, name }, "Failed to add vote");
      throw error;
    }
  }

  /**
   * Deletes a vote owned by the given user.
   * vote_history rows are cleaned up via ON DELETE CASCADE.
   */
  async deleteVote(username: string, voteId: string): Promise<void> {
    const pool = postgresService.getPool();
    if (!pool) return;

    try {
      const result = await pool.query(
        "DELETE FROM user_votes WHERE id = $1 AND username = $2",
        [voteId, username]
      );
      if (result.rowCount === 0) {
        throw new Error("Vote not found or not owned by user");
      }
    } catch (error) {
      logger.error({ err: error, username, voteId }, "Failed to delete vote");
      throw error;
    }
  }

  /**
   * Toggles the vote check-in for today.
   * If already checked in today → removes the record.
   * If not yet checked in → inserts the record.
   * Returns the new checked-in state.
   */
  async toggleVoteToday(
    username: string,
    voteId: string
  ): Promise<{ voted: boolean }> {
    const pool = postgresService.getPool();
    if (!pool) throw new Error("PostgreSQL is not enabled");

    try {
      // Verify ownership
      const ownership = await pool.query(
        "SELECT id FROM user_votes WHERE id = $1 AND username = $2",
        [voteId, username]
      );
      if (ownership.rowCount === 0) {
        throw new Error("Vote not found or not owned by user");
      }

      const todayStr = new Date().toISOString().slice(0, 10);

      // Check if already voted today
      const existing = await pool.query(
        "SELECT 1 FROM vote_history WHERE vote_id = $1 AND vote_date = $2",
        [voteId, todayStr]
      );

      if (existing.rowCount && existing.rowCount > 0) {
        // Remove today's vote
        await pool.query(
          "DELETE FROM vote_history WHERE vote_id = $1 AND vote_date = $2",
          [voteId, todayStr]
        );
        return { voted: false };
      } else {
        // Add today's vote
        await pool.query(
          "INSERT INTO vote_history (vote_id, vote_date) VALUES ($1, $2)",
          [voteId, todayStr]
        );
        return { voted: true };
      }
    } catch (error) {
      logger.error(
        { err: error, username, voteId },
        "Failed to toggle vote today"
      );
      throw error;
    }
  }
}

export const identityVotesService = new IdentityVotesService();
