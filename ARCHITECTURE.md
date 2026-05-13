# System Architecture: Gemini Bridge

## 1. Overview
Gemini Bridge is a full-stack application designed to bridge AI capabilities (via Groq/Gemini) with external messaging platforms (Telegram, Messenger) and persistent logging (Notion).

- **Frontend**: React 19 SPA, Tailwind CSS v4, Lucide Icons, Motion (Animations).
- **Backend**: Node.js, Express, TypeScript.
- **Database/Persistence**: Notion (via Notion API).
- **External Integrations**: Groq (AI), Telegram Bot API, Facebook Messenger Graph API.

## 2. Technical Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS, Axios |
| **Backend** | Node.js, Express, tsx (dev) |
| **Persistence** | Notion SDK |
| **Deployment** | Vercel (Frontend & Serverless Functions) |
| **AI Engine** | Groq (OpenAI-compatible SDK) |

## 3. Directory Structure
- `src/`: Main source code.
    - `src/server/`: Backend logic.
        - `controllers/`: Handles incoming requests and calls services.
        - `services/`: Encapsulates logic for external APIs (AI, Notion, Telegram, Messenger).
        - `routes/`: Express route definitions.
    - `src/App.tsx`: Main frontend application component.
- `api/`: Entry point for Vercel Serverless Functions.
- `server.ts`: Local development server (Express + Vite middleware).
- `scratch/`: Utility scripts for one-time tasks (e.g., setting up webhooks).

## 4. Frontend-Backend Synchronization
The project follows a "Single Repo, Unified Build" strategy:

### Development Flow
- Running `npm run dev` starts `server.ts`.
- Express uses `vite.middlewares` to serve the React app with HMR (Hot Module Replacement).
- Frontend calls API routes under `/api/*`.

### Production Flow (Vercel)
- Frontend is built via `vite build` into `dist/`.
- Vercel routes `/api/*` to `api/index.ts` (Express serverless function).
- Other routes are served as static files from the build output.

### API Communication Pattern
- **Library**: `axios` (Recommended for interceptors and consistent error handling).
- **Client Factory**: (To be implemented) A centralized `src/lib/api.ts` should manage the base URL and request/response interceptors.
- **Data Fetching**: Currently using `useEffect` and `fetch`. Future recommendation: `TanStack Query` for caching and optimistic updates.

## 5. External Integration Workflows

### AI Generation & Logging
1. User sends a prompt via Frontend or Bot.
2. `ai.service.ts` calls Groq/Gemini to generate a response.
3. `notion.service.ts` saves the prompt and response as a new page in a Notion database.
4. Response is returned to the user.

### Messaging Webhooks
- **Telegram**: Webhook points to `/api/webhook/telegram`. Messages are processed and can trigger AI responses.
- **Messenger**: Webhook points to `/api/webhook/messenger`. Requires a "Verify Token" for setup.

## 6. Security & Authentication
- **Current State**: Authentication is **Disabled** in the current implementation.
- **Planned**: JWT-based authentication using cookies. The infrastructure (`cookie-parser`, `jsonwebtoken`) is already present in `package.json` but not yet integrated into the route handlers.
- **Environment Variables**: Sensitive keys (API tokens) are stored in `.env` and accessed via `process.env` on the backend.

## 7. Development Guidelines
- **Type Safety**: Use shared interfaces for API payloads.
- **Services**: Always encapsulate external API logic in the `services/` directory.
- **Styling**: Prefer Tailwind CSS classes for UI consistency.
- **Testing**: Use `test-api.ts` for quick endpoint verification.
