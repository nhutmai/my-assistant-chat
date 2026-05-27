import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const notionMocks = vi.hoisted(() => ({
  pagesCreate: vi.fn(),
  databasesQuery: vi.fn(),
}));

vi.mock("@notionhq/client", () => ({
  Client: vi.fn().mockImplementation(function MockClient() {
    return {
      pages: {
        create: notionMocks.pagesCreate,
      },
      databases: {
        query: notionMocks.databasesQuery,
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

describe("NotionService", () => {
  beforeEach(() => {
    vi.resetModules();
    notionMocks.pagesCreate.mockReset();
    notionMocks.databasesQuery.mockReset();
    process.env.NOTION_API_KEY = "test-notion-key";
    process.env.NOTION_DATABASE_ID = "database-id";
  });

  afterEach(() => {
    delete process.env.NOTION_API_KEY;
    delete process.env.NOTION_DATABASE_ID;
  });

  it("saves a log entry to the configured Notion database", async () => {
    notionMocks.pagesCreate.mockResolvedValue({});

    const { NotionService } = await import("./notion.service.js");
    const service = new NotionService();

    await service.saveLog("Lunch 100k", {
      category: "chi tiêu",
      title: "Lunch",
      value: 100000,
      date: "2026-05-26",
    });

    expect(notionMocks.pagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        parent: { database_id: "database-id" },
        properties: expect.objectContaining({
          Category: { select: { name: "chi tiêu" } },
          Title: { rich_text: [{ text: { content: "Lunch" } }] },
          Value: { number: 100000 },
        }),
      })
    );
  });

  it("does not call Notion when database id is missing", async () => {
    delete process.env.NOTION_DATABASE_ID;

    const { NotionService } = await import("./notion.service.js");
    const service = new NotionService();

    await service.saveLog("No database", { title: "Ignored" });

    expect(notionMocks.pagesCreate).not.toHaveBeenCalled();
  });

  it("returns the latest logs from Notion", async () => {
    const results = [{ id: "page-1" }, { id: "page-2" }];
    notionMocks.databasesQuery.mockResolvedValue({ results });

    const { NotionService } = await import("./notion.service.js");
    const service = new NotionService();

    await expect(service.getLogs()).resolves.toEqual(results);
    expect(notionMocks.databasesQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        database_id: "database-id",
        page_size: 20,
      })
    );
  });

  it("returns an empty array when Notion query fails", async () => {
    notionMocks.databasesQuery.mockRejectedValue(new Error("rate limited"));

    const { NotionService } = await import("./notion.service.js");
    const service = new NotionService();

    await expect(service.getLogs()).resolves.toEqual([]);
  });
});
