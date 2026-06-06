# Multi-stage build for the SvelteKit (adapter-node) app. Runs on ARM64 (Raspberry Pi).
# Build context is the repo root (see docker/docker-compose.yml).

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Drop dev dependencies for the runtime image.
RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Run as the built-in non-root `node` user.
USER node
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node migrations ./migrations

EXPOSE 3000
# Apply pending migrations (auth + app tables, CLI-free) then start the server.
CMD ["sh", "-c", "node scripts/migrate.js && node build"]
