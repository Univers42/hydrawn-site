# Everything runs in Docker: the host has no Node.
IMAGE  := node:22-bookworm-slim
PNPM   := corepack pnpm@10.32.1
# -t only when there is a terminal, so the targets also run from scripts and CI.
TTY    := $(shell [ -t 0 ] && echo -t)
RUN    := docker run --rm -i $(TTY) --user "$$(id -u):$$(id -g)" -e HOME=/tmp -e ASTRO_TELEMETRY_DISABLED=1 -e COREPACK_HOME=/tmp/corepack \
          -e npm_config_store_dir=/app/.pnpm-store -v "$(CURDIR)":/app -w /app
PORT   ?= 4321

.PHONY: install dev check format build preview up down logs
install: ## Install dependencies (7-day release hold)
	$(RUN) $(IMAGE) $(PNPM) install
dev: ## Hot-reloading dev server on http://localhost:$(PORT)
	$(RUN) -p 127.0.0.1:$(PORT):4321 -e SITE_USE_POLLING=1 $(IMAGE) sh -c "$(PNPM) install && $(PNPM) dev"
check: ## The gate: astro check, eslint --max-warnings 0, prettier --check
	$(RUN) $(IMAGE) $(PNPM) check
format: ## Rewrite every file the way prettier --check wants it
	$(RUN) $(IMAGE) $(PNPM) format
build: ## Static build into dist/
	$(RUN) $(IMAGE) $(PNPM) build
preview: build ## Serve dist/ on http://localhost:$(PORT)
	$(RUN) -p 127.0.0.1:$(PORT):4321 $(IMAGE) $(PNPM) preview
up: ## Build the production image and serve it on http://localhost:$${SITE_PORT:-8321}
	docker compose up -d --build
down: ## Stop the production container
	docker compose down
logs: ## Follow the production container's log
	docker compose logs -f
