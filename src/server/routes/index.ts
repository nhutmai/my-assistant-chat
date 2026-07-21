import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";
import * as logController from "../controllers/log.controller.js";
import * as webhookController from "../controllers/webhook.controller.js";
import * as identityVotesController from "../controllers/identity-votes.controller.js";
import { validateBody } from "../middlewares/validate.js";
import { aiRateLimiter, webhookRateLimiter } from "../middlewares/rateLimiter.js";
import { aiGenerateSchema } from "../schemas/ai.schema.js";
import { saveIdentitySchema, addVoteSchema } from "../schemas/identity-votes.schema.js";
import { telegramUpdateSchema, messengerEventSchema } from "../schemas/webhook.schema.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import authRoutes from "./auth.js";

const router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// AI Routes
router.post(
  "/ai/generate",
  verifyJWT,
  aiRateLimiter,
  validateBody(aiGenerateSchema),
  aiController.generateAIContent
);

// Log Routes
router.get("/logs", verifyJWT, logController.getLogs);

// Identity & Votes Routes
router.get("/identity", verifyJWT, identityVotesController.getIdentity);
router.put(
  "/identity",
  verifyJWT,
  validateBody(saveIdentitySchema),
  identityVotesController.saveIdentity
);
router.get("/votes", verifyJWT, identityVotesController.getVotes);
router.post(
  "/votes",
  verifyJWT,
  validateBody(addVoteSchema),
  identityVotesController.addVote
);
router.delete("/votes/:id", verifyJWT, identityVotesController.deleteVote);
router.post("/votes/:id/toggle", verifyJWT, identityVotesController.toggleVoteToday);

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

