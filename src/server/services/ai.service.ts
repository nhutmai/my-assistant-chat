import OpenAI from "openai";
import { notionService } from "./notion.service.ts";

export class AIService {
  private groq: OpenAI;
  private readonly modelName = "llama-3.3-70b-versatile";

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined in environment variables.");
    }

    this.groq = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }

  async generateContent(prompt: string) {
    try {
      const completion = await this.groq.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: "Bạn là hệ thống trích xuất dữ liệu. Luôn trả về kết quả dưới định dạng JSON nguyên bản, không giải thích."
          },
          {
            role: "user",
            content: `Phân loại nội dung sau: "${prompt}". Schema: { category: "chi tiêu" | "ghi chú", title: string, value: number | null, date: string }`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content || "{}";
      const result = JSON.parse(content);

      // Save log to Notion
      await notionService.saveLog(prompt, result);

      return result;
    } catch (error) {
      console.error("Groq API Error:", error);
      throw new Error("Failed to generate AI content.");
    }
  }
}

export const aiService = new AIService();
