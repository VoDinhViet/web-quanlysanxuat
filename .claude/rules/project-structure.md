## Project

Web QLSX — an internal ERP for manufacturing management ("Cơ khí Tiến Huy"). All UI text
is Vietnamese; all code, identifiers, comments, and docs are English.

Package manager: pnpm.

## Standard layout

Features are vertical slices under `src/features/<domain>/` (`api/`, `components/`, `constants/`, `hooks/`, `pages/`, `schemas/`); routes in `src/routes/` stay thin.

Every feature follows the `api/` layout (`src/features/orders/api/` is the reference).

A reference resource with several consumers but no single owning feature is an **api-only
feature** (`api/` only): `units`, `operations`, `countries`. If one later gets a screen, add
`components/`/`pages/` beside its `api/`.

A feature's `components/` stays flat until a feature has several components per screen AND at
least two screens duplicate a near-identical set (e.g. create and update forms each with their
own info/items/totals sections). Then split into subfolders named after the screen (`create/`,
`update/`, `detail/`, `list/`); anything shared across screens stays at the root. Don't split
preemptively, and migrate a feature's layout only when a change already touches it. `orders`,
`clients`, `suppliers` and `materials` have split into `create/`/`update/`.

Domain types live in `src/lib/types/*.type.ts` — one file per domain, holding its types, enums
and label maps together. Features import them via `@/lib/types/<name>.type`; `src/lib` never
imports from `src/features`.

## File naming

- Component and page files are PascalCase, named after their main export (`LoginForm.tsx`,
  `UsersPage.tsx`).
- Everything else is kebab-case: schemas (`users-search.schema.ts`), types, server functions
  (`create-user.api.ts`), options (`orders.options.ts`), hooks (`use-app-form.ts`), lib, routes.
- Suffixes: `.schema.ts` for zod schemas, `.type.ts` for domain types, `.api.ts` for one
  `createServerFn` per file, `.options.ts` for one `queryOptions` factory per file.
- `src/components/ui/` is shadcn-generated and keeps shadcn's kebab-case names.
- Path alias `@/*` resolves to `src/*`.
