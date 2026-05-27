import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import logger from "../middlewares/logger.js";

interface TelegramRecipientStore {
  chatId: string;
  updatedAt: string;
}

const DEFAULT_CHAT_ID_FILE = path.join(process.cwd(), "data", "telegram-recipient.json");
const PLACEHOLDER_CHAT_ID = "your_telegram_chat_id";

let cachedChatId: string | null = normalizeChatId(process.env.TELEGRAM_CHAT_ID);

function normalizeChatId(chatId: unknown): string | null {
  if (chatId === undefined || chatId === null) return null;

  const normalized = String(chatId).trim();
  if (!normalized || normalized === PLACEHOLDER_CHAT_ID) return null;

  return normalized;
}

function getChatIdFilePath(): string {
  return process.env.TELEGRAM_CHAT_ID_FILE || DEFAULT_CHAT_ID_FILE;
}

export async function rememberTelegramChatId(chatId: string | number): Promise<void> {
  const normalized = normalizeChatId(chatId);
  if (!normalized) return;

  cachedChatId = normalized;
  process.env.TELEGRAM_CHAT_ID = normalized;

  const filePath = getChatIdFilePath();
  const payload: TelegramRecipientStore = {
    chatId: normalized,
    updatedAt: new Date().toISOString(),
  };

  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch (err: any) {
    logger.warn({ err: err.message, filePath }, "Unable to persist Telegram chat id");
  }
}

export async function getTelegramChatId(): Promise<string | null> {
  const envChatId = normalizeChatId(process.env.TELEGRAM_CHAT_ID);
  if (envChatId) {
    cachedChatId = envChatId;
    return envChatId;
  }

  if (cachedChatId) return cachedChatId;

  const filePath = getChatIdFilePath();

  try {
    const rawStore = await readFile(filePath, "utf8");
    const store = JSON.parse(rawStore) as Partial<TelegramRecipientStore>;
    const fileChatId = normalizeChatId(store.chatId);

    if (fileChatId) {
      cachedChatId = fileChatId;
      process.env.TELEGRAM_CHAT_ID = fileChatId;
      return fileChatId;
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      logger.warn({ err: err.message, filePath }, "Unable to read Telegram chat id store");
    }
  }

  return null;
}
