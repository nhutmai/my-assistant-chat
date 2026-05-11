import axios from "axios";

export class MessengerService {
  private pageAccessToken: string;

  constructor() {
    this.pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    if (!this.pageAccessToken) {
      console.warn("FB_PAGE_ACCESS_TOKEN is not defined.");
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
      console.error("Facebook Send API Error:", error.response?.data || error.message);
    }
  }
}

export const messengerService = new MessengerService();
