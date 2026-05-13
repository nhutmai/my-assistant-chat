# Debug a Broken API Endpoint

Use this skill when an API endpoint fails locally, on Vercel, or during integration with an external service.

## Debugging Workflow

Trace the full call chain in this order:

```text
route file -> controller -> service -> external API
```

Do not start by rewriting code. First identify where the request stops or changes shape.

## Step 1: Confirm the Route

Inspect route registration in:

- `src/server/routes/`
- `src/server/routes/index.ts` if present
- `src/server/index.ts`
- `server.ts`
- `api/index.ts`

Check:

- Is the endpoint mounted under `/api/`?
- Does the HTTP method match the request?
- Is the route path duplicated or missing a prefix?
- Does Vercel route traffic to `api/index.ts`?
- Is the local server using the same route structure as Vercel?

Common issue:

```text
Expected: /api/ai/generate
Actual:   /ai/generate
```

## Step 2: Check NodeNext Import Extensions

This project uses `moduleResolution: "NodeNext"`.

All server-side relative imports must include `.js`, even when importing TypeScript files.

Correct:

```ts
import routes from "./routes/index.js";
import { generateText } from "../services/ai.service.js";
```

Incorrect:

```ts
import routes from "./routes";
import { generateText } from "../services/ai.service";
```

Search for missing extensions in server files if the API fails to start or Vercel reports module resolution errors.

## Step 3: Trace Controller Behavior

Inspect the controller for:

- Request body parsing assumptions.
- Missing `return` after sending an error response.
- Thin-controller rule violations.
- Incorrect status codes.
- Errors caught but not logged.
- Promise calls that are not awaited when the response depends on them.

Controllers should mostly:

```text
read req -> call service -> return response
```

## Step 4: Trace Service Behavior

Inspect the service for:

- Missing or misspelled environment variables.
- External API base URL mistakes.
- Incorrect headers.
- Bad request payload shape.
- Provider response shape assumptions.
- Unhandled promise rejections.
- Errors swallowed without rethrowing or returning a failure result.

If a service catches errors, it should either:

- return a clear failure value the controller handles, or
- log and rethrow the error.

Avoid silent failures like:

```ts
catch (error) {
  console.error(error);
}
```

## Step 5: Verify Environment Variables

Check that required variables are:

- listed in `.env.example`
- present in local `.env`
- configured in Vercel project settings
- read with the exact same name used in code

Add temporary safe diagnostics only when needed:

```ts
console.log("Has GROQ_API_KEY:", Boolean(process.env.GROQ_API_KEY));
```

Never print secret values.

## Step 6: Test Directly

Start the server:

```bash
npm run dev
```

Test with `curl`:

```bash
curl -i -X POST "http://localhost:3000/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hello"}'
```

For webhook verification:

```bash
curl -i "http://localhost:3000/api/webhook/telegram?token=test"
```

If the project has `test-api.ts` or another local test script, use it for the affected endpoint.

## Step 7: Check Vercel-Specific Routing

For deployed failures, inspect:

- `api/index.ts`
- `vercel.json`
- route prefixes
- whether the frontend is calling `/api/...`
- whether environment variables are configured in Vercel
- whether the deployed build includes the latest route file

Verify frontend API calls use the centralized client where applicable.

## Step 8: Check Frontend Caller

If the endpoint is called from React:

- Use `src/lib/api.ts`.
- Use `axios`, not raw `fetch`.
- Avoid direct API calls inside `useEffect`; prefer a custom hook under `src/hooks/`.
- Confirm the frontend path matches the backend route.

## Final Output

When reporting the fix, include:

- the failing point in the chain
- the root cause
- files changed
- exact verification command used
- whether `npm run lint` passed
