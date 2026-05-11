import { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { notionService } from "../services/notion.service.js";
import { messengerService } from "../services/messenger.service.js";

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.FB_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

export const handleMessage = async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      // Duyệt qua tất cả các sự kiện messaging trong entry
      for (const webhookEvent of entry.messaging) {
        const senderId = webhookEvent.sender.id;

        if (webhookEvent.message && webhookEvent.message.text) {
          const messageText = webhookEvent.message.text;

          try {
            // 1. Process with AI
            const aiResult = await aiService.generateContent(messageText);

            // 2. Save to Notion
            await notionService.saveLog(messageText, aiResult);

            // 3. Respond to user
            const responseText = `✅ Đã lưu thành công!\n- Loại: ${aiResult.category}\n- Nội dung: ${aiResult.title}\n- Giá trị: ${aiResult.value || 0}`;
            await messengerService.sendMessage(senderId, responseText);
          } catch (error: any) {
            console.error("Webhook Processing Error:", error);
            // Ghi log lỗi vào Notion để hiển thị trên giao diện web
            await notionService.saveLog(messageText, { 
              category: "error", 
              title: `Error: ${error.message || "Unknown error"}`,
              value: 0,
              date: new Date().toISOString()
            });
            await messengerService.sendMessage(senderId, "❌ Có lỗi xảy ra khi xử lý tin nhắn của bạn.");
          }
        }
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};
