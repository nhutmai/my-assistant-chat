import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const axiosMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    post: axiosMocks.post,
  },
}));

vi.mock("../middlewares/logger.js", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("TelegramService", () => {
  beforeEach(() => {
    vi.resetModules();
    axiosMocks.post.mockReset();
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  it("does not send messages when the bot token is missing", async () => {
    const { TelegramService } = await import("./telegram.service.js");
    const service = new TelegramService();

    await service.sendMessage(123, "Hello");

    expect(axiosMocks.post).not.toHaveBeenCalled();
  });

  it("sends HTML messages through the Telegram Bot API", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "telegram-token";
    axiosMocks.post.mockResolvedValue({});

    const { TelegramService } = await import("./telegram.service.js");
    const service = new TelegramService();

    await service.sendMessage(123, "<b>Hello</b>");

    expect(axiosMocks.post).toHaveBeenCalledWith(
      "https://api.telegram.org/bottelegram-token/sendMessage",
      {
        chat_id: 123,
        text: "<b>Hello</b>",
        parse_mode: "HTML",
      }
    );
  });

  it("returns Telegram setWebhook response data", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "telegram-token";
    axiosMocks.post.mockResolvedValue({ data: { ok: true } });

    const { TelegramService } = await import("./telegram.service.js");
    const service = new TelegramService();

    await expect(service.setWebhook("https://example.com/hook")).resolves.toEqual({
      ok: true,
    });
    expect(axiosMocks.post).toHaveBeenCalledWith(
      "https://api.telegram.org/bottelegram-token/setWebhook",
      { url: "https://example.com/hook" }
    );
  });
});
