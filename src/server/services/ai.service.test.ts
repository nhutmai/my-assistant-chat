import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const openAiMocks = vi.hoisted(() => ({
  createCompletion: vi.fn(),
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(function MockOpenAI() {
    return {
      chat: {
        completions: {
          create: openAiMocks.createCompletion,
        },
      },
    };
  }),
}));

vi.mock("../middlewares/logger.js", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("AIService", () => {
  beforeEach(() => {
    vi.resetModules();
    openAiMocks.createCompletion.mockReset();
    process.env.GROQ_API_KEY = "test-groq-key";
  });

  afterEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  it("generates structured content from Groq JSON output", async () => {
    openAiMocks.createCompletion.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "chi tiêu",
              title: "Coffee",
              value: 45000,
              date: "2026-05-26",
            }),
          },
        },
      ],
    });

    const { AIService } = await import("./ai.service.js");
    const service = new AIService();

    await expect(service.generateContent("Coffee 45k")).resolves.toEqual({
      category: "chi tiêu",
      title: "Coffee",
      value: 45000,
      date: "2026-05-26",
    });
    expect(openAiMocks.createCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
      })
    );
  });

  it("wraps Groq failures in a safe application error", async () => {
    openAiMocks.createCompletion.mockRejectedValue(new Error("provider down"));

    const { AIService } = await import("./ai.service.js");
    const service = new AIService();

    await expect(service.generateContent("anything")).rejects.toThrow(
      "Failed to generate AI content."
    );
  });
});
