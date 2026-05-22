import { Request, Response } from "express";
import { notionService } from "../services/notion.service.js";
import logger from "../middlewares/logger.js";

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await notionService.getLogs();
    res.status(200).json({ status: "success", data: logs });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to fetch logs");
    res.status(500).json({ status: "error", message: "Failed to fetch logs" });
  }
};
