import axios from "axios";
import logger from "../middlewares/logger.js";

export class TelegramService {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken) {
      logger.warn("TELEGRAM_BOT_TOKEN is not defined.");
    }
  }

  async sendMessage(chatId: number | string, text: string) {
    if (!this.botToken) return;

    try {
      await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
      });
    } catch (error: any) {
      logger.error({ err: error.response?.data || error.message }, "Telegram sendMessage failed");
    }
  }

  async setWebhook(url: string) {
    if (!this.botToken) return;
    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, { url });
      return response.data;
    } catch (error: any) {
      logger.error({ err: error.response?.data || error.message }, "Telegram setWebhook failed");
      throw error;
    }
  }
}

export const telegramService = new TelegramService();
