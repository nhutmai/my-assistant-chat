import { Request, Response } from "express";
import { identityVotesService } from "../services/identity-votes.service.js";
import logger from "../middlewares/logger.js";

// ── Identity ───────────────────────────────────────────────────

export const getIdentity = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const identity = await identityVotesService.getIdentity(username);
    res.status(200).json({ status: "success", data: { identity } });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to get identity");
    res.status(500).json({ status: "error", message: "Failed to get identity" });
  }
};

export const saveIdentity = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { identity } = req.body;
    await identityVotesService.saveIdentity(username, identity);
    res.status(200).json({ status: "success", message: "Identity saved" });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to save identity");
    res.status(500).json({ status: "error", message: "Failed to save identity" });
  }
};

// ── Votes ──────────────────────────────────────────────────────

export const getVotes = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const votes = await identityVotesService.getVotes(username);
    res.status(200).json({ status: "success", data: votes });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to get votes");
    res.status(500).json({ status: "error", message: "Failed to get votes" });
  }
};

export const addVote = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { name } = req.body;
    const vote = await identityVotesService.addVote(username, name);
    res.status(201).json({ status: "success", data: vote });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to add vote");
    res.status(500).json({ status: "error", message: "Failed to add vote" });
  }
};

export const deleteVote = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { id } = req.params;
    await identityVotesService.deleteVote(username, id);
    res.status(200).json({ status: "success", message: "Vote deleted" });
  } catch (error: any) {
    if (error.message === "Vote not found or not owned by user") {
      res.status(404).json({ status: "error", message: error.message });
      return;
    }
    logger.error({ err: error }, "Failed to delete vote");
    res.status(500).json({ status: "error", message: "Failed to delete vote" });
  }
};

export const toggleVoteToday = async (req: Request, res: Response) => {
  try {
    const username = req.user!.username;
    const { id } = req.params;
    const result = await identityVotesService.toggleVoteToday(username, id);
    res.status(200).json({ status: "success", data: result });
  } catch (error: any) {
    if (error.message === "Vote not found or not owned by user") {
      res.status(404).json({ status: "error", message: error.message });
      return;
    }
    logger.error({ err: error }, "Failed to toggle vote");
    res.status(500).json({ status: "error", message: "Failed to toggle vote" });
  }
};
