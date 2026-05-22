import axios from "axios";
import logger from "../middlewares/logger.js";

export class MessengerService {
  private pageAccessToken: string;

  constructor() {
    this.pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    if (!this.pageAccessToken) {
      logger.warn("FB_PAGE_ACCESS_TOKEN is not defined.");
    }
  }

  async sendMessage(recipientId: string, text: string) {
    if (!this.pageAccessToken) return;

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/me/messages?access_token=${this.pageAccessToken}`,
        {
          recipient: { id: recipientId },
          message: { text: text },
        }
      );
    } catch (error: any) {
      logger.error({ err: error.response?.data || error.message }, "Facebook sendMessage failed");
    }
  }
}

export const messengerService = new MessengerService();
