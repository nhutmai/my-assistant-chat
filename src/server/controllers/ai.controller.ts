import { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { notionService } from "../services/notion.service.js";

export const generateAIContent = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const result = await aiService.generateContent(prompt);
    // Lưu vào Notion
    await notionService.saveLog(prompt, result);

    res.status(201).json({
      status: "success",
      data: result,
      message: "Content generated and logged successfully"
    });
  } catch (error: any) {
    // Ghi log lỗi vào Notion để hiển thị trên giao diện web
    await notionService.saveLog(prompt, {
      category: "error",
      title: `Error: ${error.message || "Unknown error"}`,
      value: 0,
      date: new Date().toISOString()
    });
    res.status(500).json({
      status: "error",
      message: error.message || "Internal Server Error"
    });
  }
};
