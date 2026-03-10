# Makefile for Enterprise Fintech Banking

.PHONY: help dev build test lint format docker-up docker-down clean install

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install

dev: ## Start development servers
	npm run dev

dev:client: ## Start client development server
	npm run dev:client

dev:server: ## Start server development server
	npm run dev:server

build: ## Build all projects
	npm run build

build:client: ## Build client
	npm run build:client

build:server: ## Build server
	npm run build:server

test: ## Run all tests
	npm run test

test:client: ## Run client tests
	npm run test:client

test:server: ## Run server tests
	npm run test:server

lint: ## Lint all projects
	npm run lint

format: ## Format all code
	npm run format

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

docker-logs: ## Show Docker logs
	docker-compose logs -f

clean: ## Clean build artifacts and node_modules
	rm -rf node_modules client/node_modules server/node_modules
	rm -rf client/dist server/dist
	docker-compose down -v

db-migrate: ## Run database migrations
	cd server && npm run db:migrate

db-seed: ## Seed database
	cd server && npm run db:seed

generate-keys: ## Generate security keys
	./scripts/generate-keys.sh
