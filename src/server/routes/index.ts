import { Router } from "express";
import * as aiController from "../controllers/ai.controller.ts";
import * as logController from "../controllers/log.controller.ts";

const router = Router();

// AI Routes
router.post("/ai/generate", aiController.generateAIContent);

// Log Routes
router.get("/logs", logController.getLogs);

export default router;
