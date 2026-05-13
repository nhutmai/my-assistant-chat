# Repository Guidelines

## Project Structure & Module Organization

This is a TypeScript React/Vite app with a Node/Express API layer.

- `src/App.tsx`, `src/main.tsx`, and `src/index.css` contain the frontend UI and styling.
- `src/server/index.ts` configures Express middleware and mounts API routes.
- `src/server/routes/` defines route registration; `src/server/controllers/` handles request/response logic; `src/server/services/` contains integrations for AI, Notion, Messenger, and Telegram.
- `api/index.ts` is the Vercel API entry point, while `server.ts` runs the local combined app.
- `scratch/` contains utility scripts, such as Telegram webhook setup.
- Project documentation lives in `README.md`, `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, and `FEATURES.md`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local server with `tsx server.ts`.
- `npm run build`: build the Vite frontend into `dist/`.
- `npm run preview`: preview the production Vite build locally.
- `npm run lint`: run TypeScript validation with `tsc --noEmit`.
- `npm run clean`: remove the generated `dist/` directory.

## Coding Style & Naming Conventions

Use TypeScript with ES modules. Because `tsconfig.json` uses `moduleResolution: "NodeNext"`, server-side relative imports should include `.js` extensions, for example `import routes from "./routes/index.js"`.

Follow the existing style: two-space indentation, double quotes, semicolons, React function components, and explicit names for controllers and services. Use lowercase dotted filenames for backend modules, such as `ai.controller.ts` and `telegram.service.ts`. Keep route handlers thin and put integration logic in `src/server/services/`.

## Testing Guidelines

No dedicated automated test framework is currently configured. Before submitting changes, run `npm run lint` and manually verify affected flows with `npm run dev`. For API changes, exercise the relevant endpoint, for example `POST /api/ai/generate` or webhook routes. If adding tests, place them near the code they cover or under a clear `tests/` directory, and document the new command in `package.json`.

## Commit & Pull Request Guidelines

Git history uses short, imperative commit subjects, for example `Add Telegram webhook support and service` and `Standardize API responses and update docs`. Keep commits focused on one behavior or fix.

Pull requests should include a concise summary, verification steps, linked issues when applicable, and screenshots or request/response examples for UI or API behavior changes. Note any new environment variables or deployment changes.

## Security & Configuration Tips

Do not commit secrets. Use `.env.example` as the template for local configuration, including `GROQ_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, Messenger tokens, and `TELEGRAM_BOT_TOKEN`. Keep webhook verification tokens unique per environment.
