import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { requestOtp, verifyOtp } from "../services/otp.service.js";

export async function otpRequest(req: Request, res: Response): Promise<void> {
  const { channel, username } = req.body as { channel: "facebook" | "telegram"; username: string };

  try {
    await requestOtp(username, channel);
    res.json({ success: true, message: "OTP đã được gửi" });
  } catch (err: any) {
    res.status(502).json({ error: `Gửi OTP thất bại: ${err.message}` });
  }
}

export function otpVerify(req: Request, res: Response): void {
  const { username, otp, channel } = req.body as {
    username: string;
    otp: string;
    channel: "facebook" | "telegram";
  };

  const valid = verifyOtp(username, otp, channel);
  if (!valid) {
    res.status(401).json({ error: "OTP không đúng hoặc đã hết hạn" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration: JWT_SECRET missing" });
    return;
  }

  const token = jwt.sign({ username, channel }, secret, { expiresIn: "24h" });
  res.json({ token, expiresIn: "24h" });
}
