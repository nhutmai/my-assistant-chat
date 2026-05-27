import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import logger from "../middlewares/logger.js";

interface FacebookRecipientStore {
  recipientId: string;
  updatedAt: string;
}

const DEFAULT_RECIPIENT_ID_FILE = path.join(process.cwd(), "data", "facebook-recipient.json");
const PLACEHOLDER_RECIPIENT_IDS = new Set(["your_facebook_recipient_psid"]);

let cachedRecipientId: string | null = normalizeRecipientId(process.env.FB_OTP_RECIPIENT_ID);

function normalizeRecipientId(recipientId: unknown): string | null {
  if (recipientId === undefined || recipientId === null) return null;

  const normalized = String(recipientId).trim();
  if (!normalized || PLACEHOLDER_RECIPIENT_IDS.has(normalized)) return null;

  return normalized;
}

function getRecipientIdFilePath(): string {
  return process.env.FB_OTP_RECIPIENT_ID_FILE || DEFAULT_RECIPIENT_ID_FILE;
}

export async function rememberFacebookRecipientId(recipientId: string | number): Promise<void> {
  const normalized = normalizeRecipientId(recipientId);
  if (!normalized) return;

  cachedRecipientId = normalized;
  process.env.FB_OTP_RECIPIENT_ID = normalized;

  const filePath = getRecipientIdFilePath();
  const payload: FacebookRecipientStore = {
    recipientId: normalized,
    updatedAt: new Date().toISOString(),
  };

  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  } catch (err: any) {
    logger.warn({ err: err.message, filePath }, "Unable to persist Facebook recipient id");
  }
}

export async function getFacebookRecipientId(): Promise<string | null> {
  const envRecipientId = normalizeRecipientId(process.env.FB_OTP_RECIPIENT_ID);
  if (envRecipientId) {
    cachedRecipientId = envRecipientId;
    return envRecipientId;
  }

  if (cachedRecipientId) return cachedRecipientId;

  const filePath = getRecipientIdFilePath();

  try {
    const rawStore = await readFile(filePath, "utf8");
    const store = JSON.parse(rawStore) as Partial<FacebookRecipientStore>;
    const fileRecipientId = normalizeRecipientId(store.recipientId);

    if (fileRecipientId) {
      cachedRecipientId = fileRecipientId;
      process.env.FB_OTP_RECIPIENT_ID = fileRecipientId;
      return fileRecipientId;
    }
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      logger.warn({ err: err.message, filePath }, "Unable to read Facebook recipient id store");
    }
  }

  return null;
}
