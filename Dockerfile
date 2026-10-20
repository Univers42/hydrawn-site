# The site, built and served from one image: Node builds the static files, Caddy serves
# them. Nothing of Node is left in the image that runs.

FROM node:22-bookworm-slim AS build
ENV COREPACK_HOME=/tmp/corepack ASTRO_TELEMETRY_DISABLED=1
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack pnpm@10.32.1 install --frozen-lockfile
COPY . .
# Where the site's "Start drawing" links go; empty means the real address (src/lib/app.ts).
ARG PUBLIC_APP_URL=
RUN corepack pnpm@10.32.1 build

FROM caddy:2.10.2-alpine
# Caddy writes its state under XDG dirs; point them at /tmp so it runs as nobody on a
# read-only root.
ENV XDG_CONFIG_HOME=/tmp XDG_DATA_HOME=/tmp
# The binary carries cap_net_bind_service for ports below 1024; with every capability
# dropped and no-new-privileges, the kernel refuses to exec it. It listens on 8080, so
# a plain copy (which drops file capabilities) is all it needs.
RUN cp /usr/bin/caddy /tmp/caddy && mv /tmp/caddy /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
USER nobody
EXPOSE 8080
