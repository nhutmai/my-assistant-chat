# Project Overview
Gemini Bridge is a full-stack application that acts as a middleware bridging AI inference capabilities from Groq and Gemini with messaging platforms such as Telegram and Messenger, while ensuring persistent activity logging through the Notion SDK. The system handles real-time webhooks, processes natural language through AI services, and maintains a structured history of interactions in a Notion database.

# Tech Stack
- **React 19 + Vite**: Frontend framework and build tool for a high-performance user interface.
- **Tailwind CSS v4**: Utility-first CSS framework for modern, responsive styling.
- **Node.js + Express**: Backend runtime and web framework for handling API requests and webhooks.
- **TypeScript**: Language for type-safe development across the entire stack.
- **Notion SDK**: Integration library for persisting logs and data to Notion databases.
- **Groq/OpenAI SDK**: Interface for interacting with AI models using OpenAI-compatible protocols.
- **Axios**: Promised-based HTTP client used for all frontend and backend API communications.
- **Vercel**: Deployment platform for hosting the frontend and executing serverless backend functions.

# Directory Map
- `src/server/controllers/` -> Thin handlers for managing incoming requests and outgoing responses.
- `src/server/services/` -> Core business logic and external API integrations for AI, Notion, and messaging.
- `src/server/routes/` -> Definitions for Express API endpoints and their corresponding controllers.
- `api/index.ts` -> The serverless entry point for Vercel deployments.
- `server.ts` -> Configuration for the local development server with Vite middleware and HMR.
- `scratch/` -> Storage for one-off utility scripts and administrative tasks.
- `src/lib/api.ts` -> Centralized Axios client configuration for frontend requests.

# Coding Conventions
- **Imports**: Use `.js` extensions for all relative server-side imports to satisfy NodeNext resolution (e.g., `import { x } from "./file.js"`).
- **Naming**: Use lowercase dotted filenames for all source files (e.g., `ai.controller.ts`, `telegram.service.ts`).
- **Indentation**: Apply a strict 2-space indentation throughout the codebase.
- **Quotes**: Use double quotes for all string literals.
- **Semicolons**: Always include semicolons at the end of statements.

# Backend Rules
- **Controller Contract**: Keep controllers thin; they should only handle request validation and response formatting.
- **Service Responsibility**: Place all integration logic, external API calls, and complex data processing in the `services/` directory.
- **Route Definitions**: Decouple route paths from logic by defining them in the `routes/` directory and mapping them to controllers.

# Frontend Rules
- **Component Style**: Write all React 19 components as function components.
- **Styling**: Use Tailwind CSS v4 utility classes exclusively for layout and design.
- **Icons**: Utilize Lucide icons for all UI iconography requirements.
- **API Requests**: The long-term goal is to use a centralized Axios client in `src/lib/api.ts`. Currently, legacy components may still use the raw `fetch` API, but new features should prioritize migration to Axios.

# Environment & Secrets
- **Key Registry**: Required keys include `GROQ_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `TELEGRAM_BOT_TOKEN`, `FB_PAGE_ACCESS_TOKEN`, and `FB_VERIFY_TOKEN`.
- **Access Pattern**: Retrieve all secrets via `process.env` on the backend only; never expose these to the client.
- **Forbidden Storage**: Never hardcode sensitive information; use the `.env` file for local development and Vercel dashboard for production.

# Before Every Task
- **Run Linting**: Execute `npm run lint` (`tsc --noEmit`) and fix all type errors before proceeding.
- **Manual Verification**: Manually test the affected endpoint or UI flow to ensure functional correctness.
- **Secrets Audit**: Verify that no API keys or personal credentials have been accidentally added to the source code.

# Forbidden Actions
- **DO NOT** hardcode secrets or sensitive credentials into the source code.
- **DO NOT** place business or external API integration logic directly inside controllers.
- **DO NOT** commit `.env` files to the repository; use `.env.example` for template updates.
- **DO NOT** use raw `fetch` for frontend API calls; use the centralized Axios instance.
- **DO NOT** omit the `.js` extension in server-side relative imports.
