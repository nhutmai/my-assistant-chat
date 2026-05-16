.PHONY: help install dev build preview lint clean env-docker docker-build docker-up docker-down docker-restart docker-logs docker-ps docker-shell docker-db-shell docker-config docker-clean docker-deploy

COMPOSE := docker compose
APP_SERVICE := app
DB_SERVICE := postgres

help:
	@printf "\nAvailable commands:\n\n"
	@printf "  make install         Install dependencies\n"
	@printf "  make dev             Run local development server\n"
	@printf "  make build           Build frontend assets\n"
	@printf "  make preview         Preview Vite production build\n"
	@printf "  make lint            Run TypeScript checks\n"
	@printf "  make clean           Remove build output\n"
	@printf "  make env-docker      Create .env from .env.docker.example if missing\n"
	@printf "  make docker-build    Build Docker images\n"
	@printf "  make docker-up       Start app and PostgreSQL in background\n"
	@printf "  make docker-down     Stop Docker services\n"
	@printf "  make docker-restart  Restart Docker services\n"
	@printf "  make docker-logs     Tail Docker logs\n"
	@printf "  make docker-ps       Show Docker service status\n"
	@printf "  make docker-shell    Open shell in app container\n"
	@printf "  make docker-db-shell Open psql shell in PostgreSQL container\n"
	@printf "  make docker-config   Validate expanded Docker Compose config\n"
	@printf "  make docker-clean    Stop services and remove volumes\n\n"
	@printf "  make docker-deploy   Deploy on VPS\n"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

clean:
	npm run clean

env-docker:
	@if [ ! -f .env ]; then cp .env.docker.example .env; echo "Created .env from .env.docker.example"; else echo ".env already exists"; fi

docker-build:
	$(COMPOSE) build

docker-up:
	$(COMPOSE) up --build -d

docker-down:
	$(COMPOSE) down

docker-restart:
	$(COMPOSE) restart

docker-logs:
	$(COMPOSE) logs -f

docker-ps:
	$(COMPOSE) ps

docker-shell:
	$(COMPOSE) exec $(APP_SERVICE) sh

docker-db-shell:
	$(COMPOSE) exec $(DB_SERVICE) psql -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-assistant_chat}

docker-config:
	$(COMPOSE) config

docker-clean:
	$(COMPOSE) down -v

docker-deploy:
	$(COMPOSE) down
	$(COMPOSE) up --build -d --remove-orphans
	$(COMPOSE) ps
