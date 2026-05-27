import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const postgresMocks = vi.hoisted(() => ({
  query: vi.fn(),
  on: vi.fn(),
  Pool: vi.fn(),
}));

vi.mock("pg", () => ({
  default: {
    Pool: postgresMocks.Pool,
  },
}));

vi.mock("../middlewares/logger.js", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PostgresService", () => {
  beforeEach(() => {
    vi.resetModules();
    postgresMocks.query.mockReset();
    postgresMocks.on.mockReset();
    postgresMocks.Pool.mockReset();
    postgresMocks.Pool.mockImplementation(function MockPool() {
      return {
        query: postgresMocks.query,
        on: postgresMocks.on,
      };
    });
    delete process.env.ENABLE_POSTGRES_STORAGE;
  });

  afterEach(() => {
    delete process.env.ENABLE_POSTGRES_STORAGE;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
  });

  it("does nothing when PostgreSQL persistence is disabled", async () => {
    const { PostgresService } = await import("./postgres.service.js");
    const service = new PostgresService();

    await service.saveLog("Prompt", { title: "Ignored" });
    await expect(service.getLogs()).resolves.toEqual([]);

    expect(postgresMocks.Pool).not.toHaveBeenCalled();
    expect(postgresMocks.query).not.toHaveBeenCalled();
  });

  it("saves a log entry when PostgreSQL persistence is enabled", async () => {
    process.env.ENABLE_POSTGRES_STORAGE = "true";
    process.env.POSTGRES_PORT = "5433";
    postgresMocks.query.mockResolvedValue({ rows: [] });

    const { PostgresService } = await import("./postgres.service.js");
    const service = new PostgresService();

    await service.saveLog("Coffee 45k", {
      category: "chi tiêu",
      title: "Coffee",
      value: 45000,
      date: "2026-05-26",
    });

    expect(postgresMocks.Pool).toHaveBeenCalledWith(
      expect.objectContaining({ port: 5433 })
    );
    expect(postgresMocks.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO logs"),
      ["Coffee 45k", "chi tiêu", "Coffee", 45000, "2026-05-26"]
    );
  });

  it("returns rows from PostgreSQL", async () => {
    process.env.ENABLE_POSTGRES_STORAGE = "true";
    const rows = [{ id: 1, title: "Coffee" }];
    postgresMocks.query.mockResolvedValue({ rows });

    const { PostgresService } = await import("./postgres.service.js");
    const service = new PostgresService();

    await expect(service.getLogs()).resolves.toEqual(rows);
    expect(postgresMocks.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM logs")
    );
  });

  it("swallows save errors so logging does not break the main flow", async () => {
    process.env.ENABLE_POSTGRES_STORAGE = "true";
    postgresMocks.query.mockRejectedValue(new Error("connection failed"));

    const { PostgresService } = await import("./postgres.service.js");
    const service = new PostgresService();

    await expect(service.saveLog("Prompt", {})).resolves.toBeUndefined();
  });
});
