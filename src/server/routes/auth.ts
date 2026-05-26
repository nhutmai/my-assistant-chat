import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

const otpRequestSchema = z.object({
  channel: z.enum(["facebook", "telegram"]),
  username: z.string().min(1),
});

const otpVerifySchema = z.object({
  username: z.string().min(1),
  otp: z.string().length(6),
  channel: z.enum(["facebook", "telegram"]),
});

router.post("/otp/request", validateBody(otpRequestSchema), authController.otpRequest);
router.post("/otp/verify", validateBody(otpVerifySchema), authController.otpVerify);

export default router;
