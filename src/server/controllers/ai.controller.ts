import { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { notionService } from "../services/notion.service.js";
import { postgresService } from "../services/postgres.service.js";
import logger from "../middlewares/logger.js";

export const generateAIContent = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  try {
    const result = await aiService.generateContent(prompt);
    await Promise.allSettled([
      notionService.saveLog(prompt, result),
      postgresService.saveLog(prompt, result),
    ]);

    res.status(201).json({
      status: "success",
      data: result,
      message: "Content generated and logged successfully",
    });
  } catch (error: any) {
    logger.error({ err: error, prompt }, "AI generation failed");

    const errorData = {
      category: "error",
      title: `Error: ${error.message || "Unknown error"}`,
      value: 0,
      date: new Date().toISOString(),
    };

    await Promise.allSettled([
      notionService.saveLog(prompt, errorData),
      postgresService.saveLog(prompt, errorData),
    ]);

    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
