import { Router } from "express";
import * as aiController from "../controllers/ai.controller.ts";
import * as logController from "../controllers/log.controller.ts";
import * as webhookController from "../controllers/webhook.controller.ts";

const router = Router();

// AI Routes
router.post("/ai/generate", aiController.generateAIContent);

// Log Routes
router.get("/logs", logController.getLogs);

// Messenger Webhook Routes
router.get("/webhook/messenger", webhookController.verifyWebhook);
router.post("/webhook/messenger", webhookController.handleMessage);

export default router;
