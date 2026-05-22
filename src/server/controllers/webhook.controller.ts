import { Request, Response } from "express";
import { aiService } from "../services/ai.service.js";
import { notionService } from "../services/notion.service.js";
import { postgresService } from "../services/postgres.service.js";
import { messengerService } from "../services/messenger.service.js";
import { telegramService } from "../services/telegram.service.js";
import logger from "../middlewares/logger.js";

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.FB_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.status(400).json({ status: "error", message: "fail to verify webhook" });
  }
};

export const handleMessage = async (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const webhookEvent of entry.messaging) {
        const senderId = webhookEvent.sender.id;

        if (webhookEvent.message && webhookEvent.message.text) {
          const messageText = webhookEvent.message.text;

          try {
            const aiResult = await aiService.generateContent(messageText);

            await Promise.allSettled([
              notionService.saveLog(messageText, aiResult),
              postgresService.saveLog(messageText, aiResult),
            ]);

            const responseText = `✅ Đã lưu thành công!\n- Loại: ${aiResult.category}\n- Nội dung: ${aiResult.title}\n- Giá trị: ${aiResult.value || 0}`;
            await messengerService.sendMessage(senderId, responseText);
          } catch (error: any) {
            logger.error({ err: error, senderId }, "Messenger webhook processing failed");

            const errorData = {
              category: "error",
              title: `Error: ${error.message || "Unknown error"}`,
              value: 0,
              date: new Date().toISOString(),
            };
            await Promise.allSettled([
              notionService.saveLog(messageText, errorData),
              postgresService.saveLog(messageText, errorData),
            ]);
            await messengerService.sendMessage(senderId, "❌ Có lỗi xảy ra khi xử lý tin nhắn của bạn.");
          }
        }
      }
    }
    res.status(200).json({ status: "success", message: "EVENT_RECEIVED" });
  } else {
    res.status(400).json({ status: "error", message: "Invalid webhook object" });
  }
};

export const handleTelegramMessage = async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || !message.text) {
    res.status(400).json({ status: "error", message: "Invalid message format" });
    return;
  }

  const chatId = message.chat.id;
  const messageText = message.text;

  try {
    const aiResult = await aiService.generateContent(messageText);

    await Promise.allSettled([
      notionService.saveLog(messageText, aiResult),
      postgresService.saveLog(messageText, aiResult),
    ]);

    const responseText = `<b>✅ Đã lưu thành công!</b>\n\n📌 <b>Loại:</b> ${aiResult.category}\n📝 <b>Nội dung:</b> ${aiResult.title}\n💰 <b>Giá trị:</b> ${aiResult.value || 0}\n📅 <b>Ngày:</b> ${aiResult.date}`;
    await telegramService.sendMessage(chatId, responseText);

    res.status(200).json({ status: "success", message: "Message processed" });
  } catch (error: any) {
    logger.error({ err: error, chatId }, "Telegram webhook processing failed");

    const errorData = {
      category: "error",
      title: `Telegram Error: ${error.message || "Unknown error"}`,
      value: 0,
      date: new Date().toISOString(),
    };

    await Promise.allSettled([
      notionService.saveLog(messageText, errorData),
      postgresService.saveLog(messageText, errorData),
    ]);

    await telegramService.sendMessage(chatId, "❌ Có lỗi xảy ra khi xử lý tin nhắn của bạn.");

    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};
