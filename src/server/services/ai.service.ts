import { GoogleGenAI } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateContent(prompt: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (!response.text) {
        throw new Error("No content generated from Gemini API.");
      }

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to generate AI content.");
    }
  }
}

export const aiService = new AIService();
