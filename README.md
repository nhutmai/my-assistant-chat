# My Assisstance

My Assisstance is a full-stack TypeScript app that connects AI inference with messaging channels and persistent logging. It exposes a React/Vite frontend, an Express API layer, Telegram and Messenger webhooks, and Notion-backed interaction logs.

## Tech Stack

- React 19, Vite, Tailwind CSS v4, Lucide React, Motion
- Node.js, Express, TypeScript
- Groq/OpenAI-compatible AI client
- Notion SDK for activity logging
- Telegram Bot API and Facebook Messenger Graph API
- Optional PostgreSQL service for future persistence work
- VitePress for static documentation generated from Markdown

## Project Structure

```text
api/                  Vercel serverless entry point
docs/                 VitePress documentation source
scratch/              Utility scripts, including webhook setup helpers
src/                  React frontend and Express backend source
src/server/routes/    API route definitions
src/server/controllers/ Request validation and response formatting
src/server/services/  AI, Notion, Telegram, and Messenger integrations
server.ts             Local Express + Vite development server
```

## Prerequisites

- Node.js 20 or newer
- npm
- Optional: Docker and Docker Compose for containerized local runs

## Environment Setup

Create a local environment file from the template:

```bash
cp .env.example .env
```

Fill in the values needed for the flows you want to run:

- `GROQ_API_KEY`: Groq API key for AI inference
- `NOTION_API_KEY`: Notion integration token
- `NOTION_DATABASE_ID`: Notion database used for logs
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `FB_PAGE_ACCESS_TOKEN`: Facebook page access token
- `FB_VERIFY_TOKEN`: Messenger webhook verification token
- `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`: API authentication values

Secrets must stay in local `.env` files or deployment environment variables. Do not commit real credentials.

## Local Development

Install dependencies:

```bash
npm install
```

Start the local app:

```bash
npm run dev
```

The app runs through `server.ts`, which mounts the Express API and Vite middleware. By default it listens on `http://localhost:3000`.

## Common Commands

```bash
npm run dev          # Start local Express + Vite development server
npm run build        # Build frontend assets into dist/
npm run build:server # Compile the production server into build/
npm run build:prod   # Build frontend and server
npm run start        # Run the compiled production server
npm run preview      # Preview the Vite frontend build
npm run lint         # Run TypeScript validation
npm run test         # Run Vitest tests
npm run clean        # Remove dist/
```

Makefile shortcuts are also available:

```bash
make help
make install
make dev
make lint
make build
make docker-up
make docker-down
```

## API Routes

Routes are mounted under `/api`:

- `POST /api/auth/login`
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `POST /api/ai/generate`
- `GET /api/logs`
- `GET /api/webhook/messenger`
- `POST /api/webhook/messenger`
- `POST /api/webhook/telegram`
- `GET /api/identity`
- `PUT /api/identity`
- `GET /api/votes`
- `POST /api/votes`
- `DELETE /api/votes/:id`
- `POST /api/votes/:id/toggle`

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for request and response details.

## Documentation Site

Markdown documentation is rendered into static HTML with VitePress. The VitePress source lives in `docs/` and includes the project docs, agent rule files, and skill docs from the repository.

```bash
npm run docs:dev      # Start the local VitePress docs server
npm run docs:build    # Generate static HTML into docs/.vitepress/dist
npm run docs:preview  # Preview the generated docs build
```

The generated `docs/.vitepress/dist/` directory is ignored by git and can be produced locally or in CI with `npm run docs:build`.

## Docker

Docker support runs the app with a PostgreSQL 16 service:

```bash
make docker-up
make docker-logs
make docker-down
```

Services:

- `app`: builds and runs the Vite + Express app in production mode
- `postgres`: provides a persistent PostgreSQL container

PostgreSQL is optional for the current application flow. Set `ENABLE_POSTGRES_STORAGE=true` when using Postgres-backed behavior.

## Deployment

The app is configured for Vercel through `vercel.json` and `api/index.ts`. GitHub Actions deployment to a VPS is also documented in the repository workflow files and expects environment-specific secrets such as:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_PATH`
- `VPS_REPO_URL`
- `VPS_REPO_BRANCH`
- `APP_ENV_FILE`

Store production secrets in the deployment platform or CI secret store, not in source control.

## Documentation Site

Markdown documentation can be rendered as a static HTML site with VitePress.

- `npm run docs:dev`: start the local VitePress docs server
- `npm run docs:build`: generate static HTML into `docs/.vitepress/dist`
- `npm run docs:preview`: preview the generated static docs build

The VitePress source lives in `docs/` and includes the existing root Markdown files so the project documentation remains centralized.
