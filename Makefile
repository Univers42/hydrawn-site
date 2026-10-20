# Everything runs in Docker: the host has no Node.
IMAGE  := node:22-bookworm-slim
PNPM   := corepack pnpm@10.32.1
# -t only when there is a terminal, so the targets also run from scripts and CI. CI passes
# through, so pnpm installs from the lockfile exactly (--frozen-lockfile) there.
TTY    := $(shell [ -t 0 ] && echo -t)
RUN    := docker run --rm -i $(TTY) --user "$$(id -u):$$(id -g)" -e HOME=/tmp -e ASTRO_TELEMETRY_DISABLED=1 -e CI -e PUBLIC_APP_URL -e GITHUB_TOKEN -e COREPACK_HOME=/tmp/corepack \
          -e npm_config_store_dir=/app/.pnpm-store -v "$(CURDIR)":/app -w /app
PORT   ?= 4321

.PHONY: install dev check format build preview up down logs public
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
down: ## Stop the production container (and the tunnel, if running)
	docker compose --profile public down
logs: ## Follow the production container's log
	docker compose logs -f
public: up ## Also serve it on a temporary public https address (Cloudflare quick tunnel)
	docker compose --profile public up -d tunnel
	@for i in $$(seq 1 30); do url=$$(docker compose logs tunnel 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1); [ -n "$$url" ] && { echo "Public address: $$url"; exit 0; }; sleep 1; done; echo "No address yet: docker compose logs tunnel"; exit 1
