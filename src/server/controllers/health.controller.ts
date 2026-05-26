import { createRequire } from "module";
import { Request, Response } from "express";

const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json") as { version: string };

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
  });
};
