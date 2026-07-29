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
    api/                      # data-access: server functions + queryOptions
      server-functions/         # createServerFn handlers, one per operation (*.api.ts)
      <domain>.options.ts        # all of this feature's queryOptions factories
    components/              # presentational pieces — flat by default (see below)
    hooks/                   # feature-local hooks (option hooks, mutation hubs owning state)
    pages/                   # route-level composition
    schemas/                 # *.schema.ts — zod schemas + z.infer types
  components/
    ui/                     # shadcn primitives — no business logic
    shared/                  # cross-feature components (sidebar, page chrome)
  lib/                      # http, session, utils, redirect, types/
  hooks/                    # shared hooks
```

Every feature has migrated to the `api/` layout above (`orders` → `clients` → `suppliers` →
`users` → `materials` → `products` → `auth`, in that order), and `FILTER_OPTIONS_LIMIT` has
been fully inlined to a literal at each call site and removed from `src/lib/constants.ts`.
Follow the `api/` layout for any new feature or file.

`units`, `operations`, `countries` were split off before that migration order — each is a brand-new
**api-only feature** (`api/` only, no `components/`/`pages/`/`schemas/`) extracted straight from
`src/lib/server-functions/`, not a flat-layout feature being converted. They exist because their
resource has more than one consumer but no single feature that naturally owns it (see
"Server functions" in `architecture.md`). `src/lib/server-functions/` no longer exists — every
server function now lives under some feature's `api/server-functions/`.

A feature's `components/` stays flat until it's genuinely crowded. Once a feature has
several components per screen AND at least two screens duplicate a near-identical set
(e.g. a create form and an update form each pairing with their own info/items/totals
sections), split `components/` into subfolders named after the screen (`create/`,
`update/`, `detail/`, `list/`); anything shared across screens (dialogs, table cells,
badges, a picker taking a plain `form: AnyFormApi`) stays at the `components/` root.
Don't split preemptively — most features never need it. `orders`, `clients`, `suppliers`,
and `materials` have split, each only into `create/`/`update/`; their remaining
detail/list components are still flat. `products` stays flat — it has only one section per
screen (create form, and the detail page's "Thông tin" tab), so it never crossed the
"several components per screen" threshold above. Migrate a feature's layout when a change
already touches it (same cadence as the `api/` migration above), not as a standalone
cleanup.

Domain types live globally in `src/lib/types/*.type.ts` — one file per domain (e.g.
`material.type.ts`, `user.type.ts`), holding the domain's types, enums, and label maps
together (not split per feature). Features import them via `@/lib/types/<name>.type`;
`src/lib` itself never imports from `src/features`.

Component and page files are PascalCase, named after their main export
(`LoginForm.tsx`, `UsersPage.tsx`, `TablePagination.tsx`). Everything else —
schemas, types, server functions, hooks, lib, routes — stays kebab-case
(`users-search.schema.ts`, `create-user.ts`, `use-app-form.ts`). Zod schema files end in
`.schema.ts`, domain type files end in `.type.ts`. A migrated feature's data-access files
end in `.api.ts` (one `createServerFn` per file, under `api/server-functions/`) and
`.options.ts` (that feature's `queryOptions` factories) — see `src/features/orders/api/`.
Exception: `src/components/ui/` is shadcn-generated and keeps shadcn's kebab-case names.
Path alias `@/*` resolves to `src/*`.
