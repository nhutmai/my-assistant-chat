import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import logger from "./middlewares/logger.js";

const app = express();

// Trust proxy headers (Vercel / reverse proxies)
app.set("trust proxy", 1);

// CORS
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          }
        : "*",
    credentials: true,
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api", routes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");
  res.status(err.status || 500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
  });
});

export default app;
