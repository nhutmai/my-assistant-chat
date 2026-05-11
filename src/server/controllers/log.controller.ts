import { Request, Response } from "express";
import { notionService } from "../services/notion.service.js";

export const getLogs = async (req: Request, res: Response) => {
  try {
    const logs = await notionService.getLogs();
    res.status(200).json({ data: logs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch logs" });
  }
};
