import { Request, Response } from "express";
import { aiService } from "../services/ai.service.ts";
import { notionService } from "../services/notion.service.ts";

export const generateAIContent = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const result = await aiService.generateContent(prompt);
    // Lưu vào Notion
    await notionService.saveLog(prompt, result);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    // Ghi log lỗi vào Notion để hiển thị trên giao diện web
    await notionService.saveLog(prompt, { 
      category: "error", 
      title: `Error: ${error.message || "Unknown error"}`,
      value: 0,
      date: new Date().toISOString()
    });
    res.status(500).json({ success: false, message: error.message });
  }
};
