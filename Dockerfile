# syntax=docker/dockerfile:1

# TanStack Start is an SSR app: `pnpm build` emits dist/server (the SSR + server
# function handler) and dist/client. This version (1.168) has no standalone Node
# server output, so the production server is `vite preview`, which serves the
# built SSR bundle and the server-function RPC endpoints on a port.
#
# node:24 (glibc, not alpine/musl) — Vite 8 / rolldown ship native binaries that
# are less troublesome on glibc. Matches local dev's Node version.

# ---- Base: pin pnpm to match the lockfile (v9) ----
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.4.0 --activate
WORKDIR /app

# ---- Dependencies: full install (devDeps included — vite is needed to serve) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ---- Build: VITE_API_URL is public and inlined into the bundle at build time ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ---- Runner: serve the built SSR app with a plain Node server ----
# `server.mjs` serves dist/client statically and forwards everything else to the
# built dist/server fetch handler. Deliberately NOT `vite preview`: preview re-runs
# the build plugins at startup (needs src/, regenerates routeTree.gen.ts) and
# enforces a Host allowlist that breaks behind a reverse proxy. This needs only
# dist/, the runtime node_modules the server bundle imports, and package.json
# (its "type":"module" makes dist/**/*.js and server.mjs load as ESM).
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json server.mjs ./
USER node
EXPOSE 3000
# SESSION_SECRET is injected at runtime (see docker-compose.yml), never baked in.
CMD ["node", "server.mjs"]
