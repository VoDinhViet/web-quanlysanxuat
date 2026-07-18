## Project

Web QLSX — an internal ERP for manufacturing management ("Cơ khí Tiến Huy"). All UI text
is Vietnamese; all code, identifiers, comments, and docs are English.

Stack: TanStack Start (React 19 + Vite) with file-based TanStack Router, TanStack Query,
TanStack Form, TanStack Table, Zod v4, Axios, shadcn/ui on Radix, Tailwind CSS v4.
Package manager: pnpm.

## Commands

```
pnpm dev          # vite dev --port 3000
pnpm build        # vite build
pnpm typecheck    # tsc --noEmit — run after EVERY TypeScript change
pnpm lint         # eslint (repo-wide; flags pre-existing noise in generated components/ui/)
pnpm format       # prettier --write
pnpm check        # prettier --check
```

Prefer `pnpm exec eslint <changed-file>` over the full `pnpm lint` when checking your own
change, since a repo-wide run also reports pre-existing issues in generated
`src/components/ui/` files.

There are currently no test files in the repo. Vitest is wired up (`vitest.config` lives
in `vite.config.ts`); if you add tests, colocate them as `*.test.ts(x)` next to the code
under test and run with `pnpm exec vitest run`.

## Standard layout

```
src/
  routes/                  # thin route declarations only
    (auth)/                 # public login layout group
    (authed)/                # authenticated shell + beforeLoad session guard
  features/<domain>/        # vertical slices; no cross-feature imports
    components/              # presentational pieces
    pages/                   # route-level composition
    schemas/                 # *.schema.ts — zod schemas + z.infer types
    server-functions/        # createServerFn handlers
    types/                   # *.type.ts — domain types + label maps
  components/
    ui/                     # shadcn primitives — no business logic
    shared/                  # cross-feature components (sidebar, page chrome)
  lib/                      # http, session, utils, redirect (+ types/)
  hooks/                    # shared hooks
```

Component and page files are PascalCase, named after their main export
(`LoginForm.tsx`, `UsersPage.tsx`, `TablePagination.tsx`). Everything else —
schemas, types, server functions, hooks, lib, routes — stays kebab-case
(`users-search.schema.ts`, `create-user.ts`, `use-app-form.ts`). Zod schema files end in
`.schema.ts`, domain type files end in `.type.ts`. Exception: `src/components/ui/` is
shadcn-generated and keeps shadcn's kebab-case names. Path alias `@/*` resolves to
`src/*`.
