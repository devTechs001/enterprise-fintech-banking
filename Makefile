# Convenience targets. Run `make help` to list them.
#
# This is an npm workspaces repository (client, server, shared), so dependencies are
# installed once at the root. Earlier revisions of this file claimed a root
# `npm install` was impossible and installed per workspace instead; that was working
# around a lockfile whose tarball URLs pointed at an unreachable mirror, not a
# property of the repository. See README.md → "Installing dependencies".

.PHONY: help install dev-client dev-mock dev-server build build-client test test-client \
        test-server check lint lint-client lint-server docker-up docker-down clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install all three workspaces (npm workspaces, one tree at the root)
	npm install --no-audit --no-fund

dev-client: ## Client dev server against the real API (needs the server running)
	cd client && npm run dev

dev-mock: ## Client dev server against the in-memory mock API (no database needed)
	cd client && npm run dev:mock

dev-server: ## Server dev server (needs PostgreSQL; Redis optional)
	cd server && npm run dev

build: build-client ## Production-build the client (the server runs from source)

build-client: ## Production-build the client into client/dist
	cd client && npm run build

test: test-client test-server ## Client suite (44 tests) + server self-checks (57)

test-client: ## Client vitest suite
	cd client && npm test

test-server: ## Server verification: 57 self-checks (the repo has no server test files)
	cd server && npm test

check: ## 57 server self-checks, no database required
	cd server && npm run check

lint: lint-client lint-server ## ESLint both workspaces (currently 0 errors)

lint-client: ## ESLint the client
	cd client && npm run lint

lint-server: ## ESLint the server
	cd server && npm run lint

docker-up: ## Start PostgreSQL + Redis only (app images are open work, DEV-12)
	docker-compose up -d postgres redis

docker-down: ## Stop backing services
	docker-compose down

clean: ## Remove every node_modules, dist and coverage directory
	rm -rf node_modules client/node_modules server/node_modules shared/node_modules \
	       client/dist client/coverage server/coverage
