# Add a New External API Service Integration

Use this skill when adding any new external API integration to this TypeScript React/Vite + Express project.

## Project Rules

- Put all external API calls in `src/server/services/<name>.service.ts`.
- Keep controllers thin: controllers only validate request shape, call the service, and return responses.
- Routes only register paths and HTTP methods.
- Use TypeScript ES modules.
- Because this project uses NodeNext module resolution, all server-side relative imports must include `.js`.
- Store secrets in `process.env`.
- Never hardcode API keys, tokens, base URLs with credentials, or secrets.
- Add any new environment variable to `.env.example`.
- If adding local-only variables, add them to `.env` only when the user explicitly wants local setup updated.

## Required Implementation Steps

1. Inspect existing patterns in:
   - `src/server/services/`
   - `src/server/controllers/`
   - `src/server/routes/`
   - `src/server/index.ts`
   - `.env.example`

2. Define a shared TypeScript interface for the request or response payload.

   Prefer an existing shared types location if present. Otherwise create a clear types file such as:

   ```ts
   // src/server/types/<name>.types.ts
   export interface ExampleRequestPayload {
     message: string;
     userId?: string;
   }

   export interface ExampleServiceResult {
     id: string;
     status: string;
   }
   ```

3. Create the service file:

   ```ts
   // src/server/services/example.service.ts
   import type { ExampleRequestPayload, ExampleServiceResult } from "../types/example.types.js";

   const EXAMPLE_API_KEY = process.env.EXAMPLE_API_KEY;

   export async function sendExampleRequest(
     payload: ExampleRequestPayload,
   ): Promise<ExampleServiceResult> {
     if (!EXAMPLE_API_KEY) {
       throw new Error("EXAMPLE_API_KEY is not configured");
     }

     // Put all external API logic here.
   }
   ```

4. Create the controller file:

   ```ts
   // src/server/controllers/example.controller.ts
   import type { Request, Response } from "express";
   import { sendExampleRequest } from "../services/example.service.js";
   import type { ExampleRequestPayload } from "../types/example.types.js";

   export async function createExample(req: Request, res: Response): Promise<void> {
     try {
       const payload = req.body as ExampleRequestPayload;
       const result = await sendExampleRequest(payload);

       res.status(200).json({
         success: true,
         data: result,
       });
     } catch (error) {
       console.error("Example API error:", error);

       res.status(500).json({
         success: false,
         error: "Failed to process example request",
       });
     }
   }
   ```

5. Register the route under `src/server/routes/`.

   Follow the project's existing route organization. Example:

   ```ts
   // src/server/routes/example.routes.ts
   import { Router } from "express";
   import { createExample } from "../controllers/example.controller.js";

   const router = Router();

   router.post("/example", createExample);

   export default router;
   ```

6. Mount the route from the route index or server index, depending on the existing structure.

   Example:

   ```ts
   import exampleRoutes from "./example.routes.js";

   router.use("/api", exampleRoutes);
   ```

7. Update environment documentation.

   Add required variables to `.env.example`:

   ```env
   EXAMPLE_API_KEY=
   EXAMPLE_API_BASE_URL=
   ```

8. Run validation.

   Use:

   ```bash
   npm run lint
   npm run dev
   ```

   Then test the endpoint with `curl` or the project's existing API test script.

## Worked Example Structure

For a new service named `weather`:

```text
src/server/types/weather.types.ts
src/server/services/weather.service.ts
src/server/controllers/weather.controller.ts
src/server/routes/weather.routes.ts
```

Example route:

```http
POST /api/weather/forecast
```

Expected ownership:

- `weather.service.ts`: reads `WEATHER_API_KEY`, calls the weather provider, normalizes the provider response.
- `weather.controller.ts`: reads `req.body`, calls `getWeatherForecast`, returns JSON.
- `weather.routes.ts`: registers `POST /weather/forecast`.
- Route index/server index: mounts the route under `/api`.
- `.env.example`: documents `WEATHER_API_KEY`.

## Final Check

Before finishing, verify:

- No external API calls exist in controllers or routes.
- All server-side relative imports include `.js`.
- New secrets are read only from `process.env`.
- `.env.example` includes every new required variable.
- `npm run lint` passes or any failure is reported clearly.
