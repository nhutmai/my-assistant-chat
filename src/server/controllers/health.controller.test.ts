import { describe, expect, it, vi } from "vitest";
import { createRequire } from "module";
import { getHealth } from "./health.controller.js";

const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json") as { version: string };

describe("getHealth", () => {
  it("returns a simple live status payload", () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const response = { status, json } as any;

    getHealth({} as any, response);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      status: "ok",
      timestamp: expect.any(String),
      version: packageJson.version,
    });

    const payload = json.mock.calls[0][0];
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
  });
});
