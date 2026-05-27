import axios from "axios";
import logger from "../middlewares/logger.js";
import { getTelegramChatId } from "./telegram-recipient.service.js";

interface OtpEntry {
  code: string;
  expiresAt: number;
  channel: "facebook" | "telegram";
}

// TODO: Replace with Redis in production (use ioredis + SET with EX option)
const otpStore = new Map<string, OtpEntry>();

const OTP_TTL_MS = 5 * 60 * 1000;
const WEBHOOK_TIMEOUT_MS = 5000;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpKey(username: string, channel: string): string {
  return `${username}:${channel}`;
}

async function sendViaTelegram(otp: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = await getTelegramChatId();

  if (!botToken || !chatId) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing or no Telegram chat has been registered yet");
  }

  await axios.post(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    { chat_id: chatId, text: `🔐 Mã OTP của bạn là: <b>${otp}</b>\nHiệu lực trong 5 phút.`, parse_mode: "HTML" },
    { timeout: WEBHOOK_TIMEOUT_MS }
  );
}

async function sendViaFacebook(otp: string): Promise<void> {
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const recipientId = process.env.FB_OTP_RECIPIENT_ID;
  const webhookUrl = process.env.FB_WEBHOOK_URL || "https://graph.facebook.com/v18.0/me/messages";

  if (!pageToken || !recipientId) {
    throw new Error("FB_PAGE_ACCESS_TOKEN or FB_OTP_RECIPIENT_ID is not configured");
  }

  await axios.post(
    `${webhookUrl}?access_token=${pageToken}`,
    { recipient: { id: recipientId }, message: { text: `🔐 Mã OTP của bạn là: ${otp}\nHiệu lực trong 5 phút.` } },
    { timeout: WEBHOOK_TIMEOUT_MS }
  );
}

export async function requestOtp(username: string, channel: "facebook" | "telegram"): Promise<void> {
  const code = generateOtp();
  const key = otpKey(username, channel);

  otpStore.set(key, { code, expiresAt: Date.now() + OTP_TTL_MS, channel });

  try {
    if (channel === "telegram") {
      await sendViaTelegram(code);
    } else {
      await sendViaFacebook(code);
    }
    logger.info({ username, channel }, "OTP sent");
  } catch (err: any) {
    otpStore.delete(key);
    logger.error({ err: err.message, username, channel }, "OTP send failed");
    throw err;
  }
}

export function verifyOtp(username: string, otp: string, channel: "facebook" | "telegram"): boolean {
  const key = otpKey(username, channel);
  const entry = otpStore.get(key);

  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  if (entry.code !== otp) return false;

  otpStore.delete(key);
  return true;
}
