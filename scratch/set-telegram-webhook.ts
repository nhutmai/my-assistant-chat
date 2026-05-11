/**
 * Script giúp bạn cấu hình Webhook cho Telegram Bot
 * Hướng dẫn sử dụng:
 * 1. Đảm bảo bạn đã cấu hình TELEGRAM_BOT_TOKEN trong file .env
 * 2. Thay đổi biến VERCEL_URL thành URL thật của bạn
 * 3. Chạy lệnh: npx tsx scratch/set-telegram-webhook.ts
 */

import "dotenv/config";
import { telegramService } from "../src/server/services/telegram.service.js";

const VERCEL_URL = "https://your-app.vercel.app"; // Thay thế bằng URL của bạn
const WEBHOOK_URL = `${VERCEL_URL}/api/webhook/telegram`;

async function main() {
  console.log("🚀 Đang cấu hình Webhook cho Telegram...");
  
  try {
    const result = await telegramService.setWebhook(WEBHOOK_URL);
    console.log("✅ Kết quả:", result);
  } catch (error) {
    console.error("❌ Thất bại. Hãy kiểm tra lại TELEGRAM_BOT_TOKEN.");
  }
}

main();
