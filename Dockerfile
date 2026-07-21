# syntax=docker/dockerfile:1

# TanStack Start is an SSR app: `pnpm build` emits dist/server (the SSR + server
# function handler) and dist/client. This version (1.168) has no standalone Node
# server output, so the production server is `vite preview`, which serves the
# built SSR bundle and the server-function RPC endpoints on a port.
#
# node:22 (glibc, not alpine/musl) — Vite 8 / rolldown ship native binaries that
# are less troublesome on glibc.

# ---- Base: pin pnpm to match the lockfile (v9) ----
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
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

# ---- Runner: serve the built SSR app ----
# `vite preview` re-runs the tanstackStart + router plugins on startup: it resolves
# the router entry from src/ and regenerates src/routeTree.gen.ts. So the runner
# needs the FULL built project (src, config files, node_modules) — not just dist —
# and that tree must be writable, hence --chown to the non-root `node` user. The
# whole /app from the build stage is copied as one layer to guarantee parity with
# what actually built. Run vite DIRECTLY via node (never `pnpm exec`): pnpm would
# run as `node`, pick its own corepack version instead of the pinned one, and write
# a temp file into /app for its deps-status check — which fails with EACCES.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 3000
# SESSION_SECRET is injected at runtime (see docker-compose.yml), never baked in.
CMD ["node", "node_modules/vite/bin/vite.js", "preview", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
