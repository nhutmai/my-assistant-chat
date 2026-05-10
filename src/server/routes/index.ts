import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import * as aiController from "../controllers/ai.controller.ts";
import { authMiddleware } from "../middlewares/auth.middleware.ts";

const router = Router();

// Auth Routes
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// AI Routes (Protected)
router.post("/ai/generate", authMiddleware, aiController.generateAIContent);

export default router;
