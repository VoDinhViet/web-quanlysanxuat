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

# ---- Runner: vite preview loads vite.config.ts, so it needs node_modules + config ----
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml vite.config.ts tsconfig.json ./
USER node
EXPOSE 3000
# SESSION_SECRET is injected at runtime (see docker-compose.yml), never baked in.
CMD ["pnpm", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "3000", "--strictPort"]
