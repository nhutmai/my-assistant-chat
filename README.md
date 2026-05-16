<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5d1cd24a-6bda-4b98-acdb-af0ba83d2373

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Docker

Docker support is set up in an isolated way so the current app flow does not need to change.

1. Create your Docker env file:
   `make env-docker`
2. Start the app and PostgreSQL:
   `make docker-up`
3. Open the app:
   `http://localhost:3000`

Services included:

- `app`: builds the current Vite + Express app and runs it in production mode
- `postgres`: provides a PostgreSQL 16 instance with a persistent Docker volume

Notes:

- The repository does not currently use PostgreSQL in application code yet. The database is provisioned and ready for future integration.
- `DATABASE_URL` is injected into the app container automatically by `docker-compose.yml`.

## Makefile

Common shortcuts are available through `Makefile`:

- `make help`: show all available commands
- `make dev`: run the local development server
- `make lint`: run TypeScript validation
- `make build`: build frontend assets
- `make docker-up`: build and start Docker services
- `make docker-down`: stop Docker services
- `make docker-logs`: tail Docker logs
- `make docker-db-shell`: open a `psql` session inside the PostgreSQL container

## GitHub Deploy to VPS

The GitHub Actions workflow deploys to a VPS over SSH on pushes to `main`.

Required GitHub Secrets:

- `VPS_HOST`: VPS public IP or domain
- `VPS_PORT`: SSH port, usually `22`
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: private SSH key used by GitHub Actions
- `VPS_APP_PATH`: absolute app path on the VPS, for example `/opt/my-assistant-chat`
- `VPS_REPO_URL`: Git repository SSH/HTTPS URL
- `VPS_REPO_BRANCH`: branch to deploy, usually `main`
- `APP_ENV_FILE`: full `.env` file content written on the VPS before `docker compose up`
