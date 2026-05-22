import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import * as logController from "../controllers/log.controller.js";
import * as webhookController from "../controllers/webhook.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { aiRateLimiter, webhookRateLimiter } from "../middlewares/rateLimiter.js";
import { aiGenerateSchema } from "../schemas/ai.schema.js";
import { telegramUpdateSchema, messengerEventSchema } from "../schemas/webhook.schema.js";

const router = Router();

// AI Routes
router.post(
  "/ai/generate",
  aiRateLimiter,
  validateBody(aiGenerateSchema),
  aiController.generateAIContent
);

// Log Routes
router.get("/logs", logController.getLogs);

// Messenger Webhook Routes
router.get("/webhook/messenger", webhookController.verifyWebhook);
router.post(
  "/webhook/messenger",
  webhookRateLimiter,
  validateBody(messengerEventSchema),
  webhookController.handleMessage
);

// Telegram Webhook Route
router.post(
  "/webhook/telegram",
  webhookRateLimiter,
  validateBody(telegramUpdateSchema),
  webhookController.handleTelegramMessage
);

export default router;
