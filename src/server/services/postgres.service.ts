import pg from "pg";
import logger from "../middlewares/logger.js";
const { Pool } = pg;

/**
 * Service for handling PostgreSQL persistence.
 * Mirrors the NotionService interface for consistent data logging.
 */
export class PostgresService {
  private pool: pg.Pool | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.ENABLE_POSTGRES_STORAGE === "true";

    if (this.isEnabled) {
      this.pool = new Pool({
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT || "5432"),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
      });

      this.pool.on("error", (err) => {
        logger.warn({ err }, "Unexpected error on idle PostgreSQL client");
      });
    }
  }

  /**
   * Saves a log entry to PostgreSQL.
   * This method is designed to be non-blocking and handles its own errors
   * to ensure that failures in PostgreSQL do not affect the main application flow.
   * 
   * @param prompt - The original input prompt from the user.
   * @param data - The structured data extracted by the AI service.
   */
  async saveLog(prompt: string, data: any): Promise<void> {
    if (!this.isEnabled || !this.pool) return;

    try {
      const query = `
        INSERT INTO logs (prompt, category, title, value, date)
        VALUES ($1, $2, $3, $4, $5)
      `;
      const values = [
        prompt,
        data.category || "unknown",
        data.title || "Untitled",
        data.value || 0,
        data.date || new Date().toISOString()
      ];
      await this.pool.query(query, values);
    } catch (error) {
      logger.warn({ err: error }, "PostgreSQL save failed");
    }
  }

  /**
   * Retrieves the latest 20 log entries from the PostgreSQL database.
   * 
   * @returns A promise that resolves to an array of log records.
   */
  async getLogs(): Promise<any[]> {
    if (!this.isEnabled || !this.pool) return [];

    try {
      const query = `
        SELECT * FROM logs
        ORDER BY created_at DESC
        LIMIT 20
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error({ err: error }, "PostgreSQL query failed");
      return [];
    }
  }
}

export const postgresService = new PostgresService();
