# Repository & Project Guidelines

## Project Overview
Gemini Bridge is a full-stack application that acts as a middleware bridging AI inference capabilities from Groq and Gemini with messaging platforms such as Telegram and Messenger, while ensuring persistent activity logging through the Notion SDK. The system handles real-time webhooks, processes natural language through AI services, and maintains a structured history of interactions in a Notion database.

## Tech Stack
- **React 19 + Vite**: Frontend framework and build tool for a high-performance user interface.
- **Tailwind CSS v4**: Utility-first CSS framework for modern, responsive styling.
- **Node.js + Express**: Backend runtime and web framework for handling API requests and webhooks.
- **TypeScript**: Language for type-safe development across the entire stack.
- **Notion SDK**: Integration library for persisting logs and data to Notion databases.
- **Groq/OpenAI SDK**: Interface for interacting with AI models using OpenAI-compatible protocols.
- **Axios**: Promise-based HTTP client used for all frontend and backend API communications.
- **Vercel**: Deployment platform for hosting the frontend and executing serverless backend functions.

## Project Structure & Module Organization
This is a TypeScript React/Vite app with a Node/Express API layer.

- `src/App.tsx`, `src/main.tsx`, and `src/index.css` contain the frontend UI and styling.
- `src/server/index.ts` configures Express middleware and mounts API routes.
- `src/server/routes/` defines Express API endpoints decoupled from logic.
- `src/server/controllers/` handles request/response logic and validation (keep them thin).
- `src/server/services/` contains core business logic, integrations for AI, Notion, Messenger, and Telegram.
- `src/lib/api.ts` is the centralized Axios client configuration for frontend requests.
- `api/index.ts` is the serverless entry point for Vercel deployments.
- `server.ts` runs the local development server with Vite middleware and HMR.
- `scratch/` contains utility scripts, such as Telegram webhook setup.
- Project documentation lives in `README.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, and `ROADMAP.md`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies from `package-lock.json`.
- `npm run dev`: Start the local server with `tsx server.ts`.
- `npm run build`: Build the Vite frontend into `dist/`.
- `npm run preview`: Preview the production Vite build locally.
- `npm run lint`: Run TypeScript validation with `tsc --noEmit`.
- `npm run clean`: Remove the generated `dist/` directory.

## Coding Style & Naming Conventions
- **TypeScript**: Use TypeScript with ES modules across the entire stack.
- **Imports**: Because `tsconfig.json` uses `moduleResolution: "NodeNext"`, server-side relative imports must include `.js` extensions (e.g., `import routes from "./routes/index.js"`).
- **Naming**: Use explicit names for controllers and services. Use lowercase dotted filenames for backend modules (e.g., `ai.controller.ts` and `telegram.service.ts`).
- **Formatting**: Two-space indentation, double quotes, and semicolons at the end of statements.
- **React Components**: Write all React 19 components as function components.
- **Styling**: Use Tailwind CSS v4 utility classes exclusively for layout and design.
- **Icons**: Utilize Lucide icons for all UI iconography requirements.
- **API Requests**: Prioritize migration to and usage of the centralized Axios client in `src/lib/api.ts` instead of raw `fetch`.

## Backend & Integration Rules
- **Controller Contract**: Keep controllers thin; they should only handle request validation and response formatting.
- **Service Responsibility**: Place all integration logic, external API calls, and complex data processing in the `src/server/services/` directory.
- **Route Definitions**: Decouple route paths from logic by defining them in the `src/server/routes/` directory and mapping them to controllers.

## Testing Guidelines
No dedicated automated test framework is currently configured. Before submitting changes, run `npm run lint` and manually verify affected flows with `npm run dev`. For API changes, exercise the relevant endpoint, for example `POST /api/ai/generate` or webhook routes. If adding tests, place them near the code they cover or under a clear `tests/` directory, and document the new command in `package.json`.

## Security, Environment & Configuration
- **Key Registry**: Required keys include `GROQ_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `TELEGRAM_BOT_TOKEN`, `FB_PAGE_ACCESS_TOKEN`, and `FB_VERIFY_TOKEN`.
- **Access Pattern**: Retrieve all secrets via `process.env` on the backend only; never expose these to the client.
- **Secrets Audit**: Do not commit secrets. Use `.env.example` as the template for local configuration. Never hardcode sensitive information; use `.env` for local development and the Vercel dashboard for production.
- **Webhook Security**: Keep webhook verification tokens unique per environment.

## Commit & Pull Request Guidelines
- **Git History**: Use short, imperative commit subjects (e.g., `Add Telegram webhook support and service`, `Standardize API responses and update docs`). Keep commits focused on one behavior or fix.
- **Pull Requests**: Include a concise summary, verification steps, linked issues when applicable, and screenshots or request/response examples for UI or API behavior changes. Note any new environment variables or deployment changes.

## Before Every Task
- **Run Linting**: Execute `npm run lint` (`tsc --noEmit`) and fix all type errors before proceeding.
- **Manual Verification**: Manually test the affected endpoint or UI flow to ensure functional correctness.
- **Secrets Audit**: Verify that no API keys or personal credentials have been accidentally added to the source code.

## UI / Design Rules
The Bento design system must be applied automatically to every UI task—even when the user makes no mention of design or style:
- **Silently Read Design Docs**: Always read `.agent/skills/bento/DESIGN.md` and `.agent/skills/bento/SKILL.md` before writing any UI/frontend code.
- **Scope**: These rules are always active for all components, pages, layouts, and forms, without needing an explicit prompt.
- **Bento Tokens Only**: Use only the designated colors:
  - **Light Mode**: primary `#FAD4C0` (pastel peach), secondary `#80A1C1` (periwinkle slate blue), surface `#FFF5E6` (warm cream surface), text `#111827` (charcoal text).
  - **Dark Mode**: primary `#F8C6AF` (peach highlight), secondary `#A2BDD6` (light slate blue), surface `#1E2330` (dark slate surface), text `#F9FAFB` (cool off-white text).
- **Spacing Scale**: Adhere strictly to the spacing scale `4/8/12/16/24/32`px (e.g., using Tailwind equivalents like `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8`). Never use arbitrary values.
- **Fonts**: Use `Inter` for all UI text and headings, and `JetBrains Mono` for all labels and code blocks.
- **Layout & Sizing**: Use a modular bento grid layout with card-like blocks, clear visual hierarchy, soft spacing, and rounded corners (`rounded-2xl` for cards, `rounded-xl` for buttons/inputs).
- **Interaction States**: Every interactive element (buttons, links, inputs, tabs, etc.) must explicitly define all of the following states: default, hover, focus-visible, active (e.g., active:scale-95), and disabled.
- **Accessibility**: Ensure full WCAG 2.2 AA contrast compliance on all text and interactive elements.



## Forbidden Actions
- **DO NOT** hardcode secrets or sensitive credentials into the source code.
- **DO NOT** place business or external API integration logic directly inside controllers.
- **DO NOT** commit `.env` files to the repository; use `.env.example` for template updates.
- **DO NOT** use raw `fetch` for frontend API calls; use the centralized Axios instance.
- **DO NOT** omit the `.js` extension in server-side relative imports.
