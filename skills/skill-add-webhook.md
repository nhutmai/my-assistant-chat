# Add a New Messaging Platform Webhook

Use this skill when adding a webhook integration for a messaging platform such as Telegram, Messenger, WhatsApp, Slack, Discord, or another chat provider.

## Project Rules

- Webhook routes live under `/api/webhook/<platform>`.
- Verification uses `GET /api/webhook/<platform>`.
- Incoming events use `POST /api/webhook/<platform>`.
- Token verification must read the expected token from `process.env`.
- Return `200` for successful verification.
- Return `400` for bad verification tokens.
- Log the incoming payload at the start of the POST handler.
- Delegate all platform-specific processing to a service file.
- Keep controllers thin.
- Use `.js` extensions on all server-side relative imports.
- Document every new environment variable in `.env.example`.

## Required Implementation Steps

1. Inspect existing webhook patterns in:
   - `src/server/routes/`
   - `src/server/controllers/`
   - `src/server/services/`
   - `src/server/index.ts`
   - `.env.example`

2. Create a service file:

   ```ts
   // src/server/services/platform.service.ts
   export async function processPlatformWebhook(payload: unknown): Promise<void> {
     // Parse and process incoming platform events here.
     // Put all external API calls and message handling logic in this service.
   }
   ```

3. Create a controller file:

   ```ts
   // src/server/controllers/platform.controller.ts
   import type { Request, Response } from "express";
   import { processPlatformWebhook } from "../services/platform.service.js";

   const VERIFY_TOKEN = process.env.PLATFORM_VERIFY_TOKEN;

   export function verifyPlatformWebhook(req: Request, res: Response): void {
     const token = req.query["hub.verify_token"] ?? req.query.token;
     const challenge = req.query["hub.challenge"] ?? "OK";

     if (!VERIFY_TOKEN || token !== VERIFY_TOKEN) {
       res.status(400).json({
         success: false,
         error: "Invalid verification token",
       });
       return;
     }

     res.status(200).send(challenge);
   }

   export async function handlePlatformWebhook(req: Request, res: Response): Promise<void> {
     console.log("Incoming platform webhook payload:", req.body);

     try {
       await processPlatformWebhook(req.body);

       res.status(200).json({
         success: true,
       });
     } catch (error) {
       console.error("Platform webhook processing error:", error);

       res.status(500).json({
         success: false,
         error: "Failed to process webhook",
       });
     }
   }
   ```

4. Create or update a route file:

   ```ts
   // src/server/routes/platform.routes.ts
   import { Router } from "express";
   import {
     handlePlatformWebhook,
     verifyPlatformWebhook,
   } from "../controllers/platform.controller.js";

   const router = Router();

   router.get("/webhook/platform", verifyPlatformWebhook);
   router.post("/webhook/platform", handlePlatformWebhook);

   export default router;
   ```

5. Mount the route under `/api`.

   Example:

   ```ts
   router.use("/api", platformRoutes);
   ```

   Final paths must be:

   ```http
   GET /api/webhook/<platform>
   POST /api/webhook/<platform>
   ```

6. Update `.env.example`:

   ```env
   PLATFORM_VERIFY_TOKEN=
   PLATFORM_BOT_TOKEN=
   PLATFORM_APP_SECRET=
   ```

   Include only variables actually needed by the platform.

## Verification

Test verification success:

```bash
curl "http://localhost:3000/api/webhook/platform?token=expected-token"
```

Test verification failure:

```bash
curl -i "http://localhost:3000/api/webhook/platform?token=wrong-token"
```

Test incoming payload:

```bash
curl -X POST "http://localhost:3000/api/webhook/platform" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"hello"}}'
```

## Final Check

Before finishing, verify:

- GET verification returns `200` for the correct token.
- GET verification returns `400` for the wrong token.
- POST logs the incoming payload at the start of the handler.
- POST delegates processing to the service.
- No platform API logic exists in the route file.
- `.env.example` documents all new variables.
- All server-side relative imports include `.js`.
