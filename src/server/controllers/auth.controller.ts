import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { requestOtp, verifyOtp } from "../services/otp.service.js";

function signToken(payload: object): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET missing");
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function passwordLogin(req: Request, res: Response): void {
  const { username, password } = req.body as { username: string; password: string };

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    res.status(500).json({ error: "Server misconfiguration: ADMIN_USERNAME/ADMIN_PASSWORD missing" });
    return;
  }

  if (username !== adminUser || password !== adminPass) {
    res.status(401).json({ error: "Sai username hoặc password" });
    return;
  }

  try {
    const token = signToken({ username });
    res.json({ token, expiresIn: "24h" });
  } catch {
    res.status(500).json({ error: "Server misconfiguration: JWT_SECRET missing" });
  }
}

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

  try {
    const token = signToken({ username, channel });
    res.json({ token, expiresIn: "24h" });
  } catch {
    res.status(500).json({ error: "Server misconfiguration: JWT_SECRET missing" });
  }
}
