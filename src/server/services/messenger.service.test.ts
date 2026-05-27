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

describe("MessengerService", () => {
  beforeEach(() => {
    vi.resetModules();
    axiosMocks.post.mockReset();
    delete process.env.FB_PAGE_ACCESS_TOKEN;
  });

  afterEach(() => {
    delete process.env.FB_PAGE_ACCESS_TOKEN;
  });

  it("does not send messages when the page access token is missing", async () => {
    const { MessengerService } = await import("./messenger.service.js");
    const service = new MessengerService();

    await service.sendMessage("recipient-1", "Hello");

    expect(axiosMocks.post).not.toHaveBeenCalled();
  });

  it("sends text messages through the Messenger Send API", async () => {
    process.env.FB_PAGE_ACCESS_TOKEN = "page-token";
    axiosMocks.post.mockResolvedValue({});

    const { MessengerService } = await import("./messenger.service.js");
    const service = new MessengerService();

    await service.sendMessage("recipient-1", "Hello");

    expect(axiosMocks.post).toHaveBeenCalledWith(
      "https://graph.facebook.com/v21.0/me/messages?access_token=page-token",
      {
        recipient: { id: "recipient-1" },
        message: { text: "Hello" },
      }
    );
  });
});
