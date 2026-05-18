import { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { notionService } from "../services/notion.service.js";
import { postgresService } from "../services/postgres.service.js";

export const generateAIContent = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const result = await aiService.generateContent(prompt);
    // Lưu vào Notion và PostgreSQL song song
    await Promise.allSettled([
      notionService.saveLog(prompt, result),
      postgresService.saveLog(prompt, result)
    ]);

    res.status(201).json({
      status: "success",
      data: result,
      message: "Content generated and logged successfully"
    });
  } catch (error: any) {
    const errorData = {
      category: "error",
      title: `Error: ${error.message || "Unknown error"}`,
      value: 0,
      date: new Date().toISOString()
    };

    // Ghi log lỗi vào cả hai hệ thống lưu trữ
    await Promise.allSettled([
      notionService.saveLog(prompt, errorData),
      postgresService.saveLog(prompt, errorData)
    ]);

    res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};
