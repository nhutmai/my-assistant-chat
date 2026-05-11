import axios from "axios";

export class TelegramService {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || "";
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken) {
      console.warn("TELEGRAM_BOT_TOKEN is not defined.");
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
      console.error("Telegram Send API Error:", error.response?.data || error.message);
    }
  }

  async setWebhook(url: string) {
    if (!this.botToken) return;
    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, { url });
      return response.data;
    } catch (error: any) {
      console.error("Telegram SetWebhook Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export const telegramService = new TelegramService();
