# Implementation Plan: User Management UI (Nhân sự)

**Branch**: `001-user-management-ui` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-user-management-ui/spec.md`

**User directive**: "fake data be chưa có" — the backend does not exist yet. The entire feature runs on fake data. The UI must not know this: all data access goes through server functions with the final `ActionResult` contract, backed by a seeded in-memory repository that is later replaced by real backend calls without touching any component.

## Summary

Build the first real screen of the QLSX ERP: the User Management page (Hệ thống → Nhân sự) plus the application shell it lives in (sidebar, header, breadcrumb). The screen delivers a paginated user table with search/filters, a right-hand detail panel with two tabs, create/edit/delete flows with confirmation, and CSV export — all state shareable via URL. Because no backend exists, server functions serve deterministic seeded fake data through a repository seam (`UserRepository`), so swapping to the real API later is a one-file change.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, `verbatimModuleSyntax`), React 19

**Primary Dependencies**: TanStack Start (SSR + server functions), TanStack Router (file-based routes, search params), Tailwind CSS v4, shadcn/ui primitives (already generated in `src/components/ui/`), sonner (toasts), date-fns (dates), lucide/tabler icons. **To add**: `zod` (named in the constitution's stack; not yet installed) and `@tanstack/react-form` (the constitution's form rules reference its API — `field.state.meta.isTouched`). No other additions.

**Storage**: None. Seeded in-memory fake data store (module-level, deterministic seed of ~40 users + activity logs) living behind server functions. No persistence across server restarts — acceptable and explicit for the fake phase.

**Testing**: Vitest + Testing Library (already configured). Unit tests target the pure logic: fake repository filtering/pagination, diacritic-insensitive search, CSV building, Zod schemas.

**Target Platform**: Web, desktop-first (factory office use), SSR via TanStack Start dev/build.

**Project Type**: Web application — frontend with server functions, no separate backend.

**Performance Goals**: Any list interaction (page, filter, search) reflects results in under 1s with 1,000 seeded users (SC-004); search input debounced so typing stays smooth.

**Constraints**: All UI text Vietnamese; domain values language-neutral with `Record<Enum, string>` label maps; list state (page, size, search, filters, selected user, tab) lives in Zod-validated URL search params; no new dependencies beyond the two named above; semantic Tailwind tokens only.

**Scale/Scope**: One screen + app shell; 8 departments, ~10 positions, 2 statuses; seeded 40 users (dev default) with a 1,000-record seed mode for the performance check.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.* — against Constitution v1.1.0.

| # | Principle | Status | How the design complies |
| --- | --------- | ------ | ------------------------ |
| I | Layered Architecture | ✅ PASS | New domain folder `src/features/users/{components,pages,schemas,server-functions,types}/`. Route files contain only `createFileRoute` + `validateSearch` + `component` pointing at `UsersPage`. App shell is shared chrome, not a feature, so it goes to `src/components/shared/app-shell/`. No feature-to-feature imports (only one feature exists). `src/components/ui/` and `routeTree.gen.ts` untouched by hand. |
| II | Type Safety Without Escape Hatches | ✅ PASS | No `any` / `@ts-ignore` / `!`. Form and search-param types derived via `z.infer`. `import type` everywhere applicable. `type` over `interface`. |
| III | Server Functions Return, Never Throw | ✅ PASS | All six server functions validate input with Zod via `.validator()`, declare `Promise<ActionResult<T>>`, and return errors as values with Vietnamese messages (with `default` branch). Shared `http` client: **not applicable this phase** — there is no HTTP at all; the repository seam is where the shared client plugs in when the backend lands. No ad-hoc HTTP client is created (there is none). |
| IV | Server-Side Secrets and Sessions | ✅ PASS (n/a scope noted) | No tokens, secrets, or env vars are introduced; fake data is public sample data. The app has **no auth module yet**, so no route is "authenticated" — the `beforeLoad` session guard obligation attaches when the auth feature exists and is recorded in research.md as an explicit follow-up so it is not silently dropped. No `VITE_` variables added. |
| V | Verification by Execution | ✅ PASS | quickstart.md defines runnable end-to-end validation scenarios per user story; definition of done includes `pnpm typecheck`, `pnpm lint`, `pnpm format`, full-diff re-read, and exercising the flow in the running app. |

**Technology & Code Standards check**: Vietnamese labels only in UI via `Record<UserStatus | Gender, string>` maps (domain stores `"active"`, never `"Hoạt động"`); `cn()` for class composition; semantic tokens (`bg-card`, `text-muted-foreground`); a11y rules (aria-label on icon buttons, `htmlFor`/`id`, `aria-invalid`, explicit button `type`); forms follow the constitution contract (Zod single source, `noValidate`, `preventDefault` + `stopPropagation`, touched-gated errors); shareable state in `.catch()`-guarded URL search params; components split before ~150 lines.

**Dependency gate**: `zod` and `@tanstack/react-form` require approval before install (constitution: "A dependency MUST NOT be added without approval"). `zod` is explicitly named in the constitution's stack (pre-sanctioned); `@tanstack/react-form` is implied by the constitution's own form rules. Both are surfaced in the plan completion report for the user's confirmation; no other dependency is added (notably: no `@tanstack/react-table`, no `xlsx`, no MSW, no faker — see research.md R1, R5, R7).

**Post-Phase-1 re-check**: design artifacts (data-model.md, contracts/, quickstart.md) introduce no violation — data model is presentation-free, contracts are `ActionResult`-shaped, structure matches Principle I. Gate result unchanged: ✅ PASS. Complexity Tracking remains empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-management-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── user-server-functions.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                          # existing shadcn/ui primitives — NOT modified
│   └── shared/
│       └── app-shell/               # NEW: app chrome shared by all future modules
│           │                        #   (files named per the shadcn sidebar block convention)
│           ├── app-sidebar.tsx      # AppSidebar: Sidebar + SidebarHeader (brand) + NavMain;
│           │                        #   nav data defined inline, shadcn-block style
│           ├── nav-main.tsx         # NavMain: one SidebarGroup + SidebarMenu per module
│           │                        #   group; isActive for Nhân sự, disabled placeholders
│           └── site-header.tsx      # SiteHeader: SidebarTrigger ("Thu gọn"), breadcrumb,
│                                    #   notification/help buttons, user dropdown
├── features/
│   └── users/
│       ├── components/
│       │   ├── user-table.tsx           # table + row actions + pagination footer
│       │   ├── user-filters.tsx         # search box + 3 dropdowns + advanced filter
│       │   ├── user-detail-panel.tsx    # right panel: header + tabs
│       │   ├── user-general-info.tsx    # THÔNG TIN CHUNG + GHI CHÚ sections
│       │   ├── activity-history-list.tsx    # Lịch sử hoạt động tab content
│       │   ├── user-form-dialog.tsx     # create/edit form (TanStack Form + Zod)
│       │   ├── delete-user-dialog.tsx   # confirmation naming the user
│       │   ├── user-status-badge.tsx    # status → badge variant + label
│       │   └── labels.ts                # Record<Enum, string> Vietnamese maps
│       ├── pages/
│       │   └── users-page.tsx       # composes filters + table + panel
│       ├── schemas/
│       │   ├── user-form-schema.ts      # create/edit input schema (z.infer types)
│       │   └── user-search-schema.ts    # URL search params schema (.catch() guarded)
│       ├── server-functions/
│       │   ├── users.ts                 # list/get/create/update/delete/activity
│       │   ├── repository.ts                # UserRepository seam (swap point for real BE)
│       │   └── fake-data.ts                 # deterministic seed + in-memory store
│       ├── types/
│       │   └── user.ts                  # domain types: User, status/gender enums, page result
│       └── utils/
│           └── csv.ts                       # filtered rows → UTF-8-BOM CSV (feature-local until 2nd consumer)
├── lib/
│   ├── action-result.ts             # NEW shared: ActionResult<T> discriminated union
│   └── utils.ts                     # existing cn()
└── routes/
    ├── __root.tsx                   # updated: lang="vi", app title, <Toaster /> mount
    ├── index.tsx                    # updated: redirect "/" → "/users" (dashboard is a later feature)
    └── _app/
        ├── route.tsx                # pathless layout: SidebarProvider + AppSidebar +
        │                            #   SidebarInset (SiteHeader + <Outlet />)
        └── users.tsx            # validateSearch(userSearchSchema) → UsersPage
```

**Structure Decision**: Single-project TanStack Start app (no separate backend — server functions are the backend seam). The feature lives entirely in `src/features/users/` per Principle I; the only shared additions are the app shell (`src/components/shared/app-shell/`, chrome that every future module reuses) and `src/lib/action-result.ts` (the cross-feature server-function contract mandated by Principle III). Route path is `/users` (identifiers are English; Vietnamese appears in UI text only — see research.md R8).

**App-shell naming convention** — files follow the shadcn sidebar block naming exactly (kebab-case file, PascalCase export, one component per file, nav data inline in `app-sidebar.tsx` as shadcn blocks do — no separate config file):

| File | Export | Role |
| ---- | ------ | ---- |
| `app-sidebar.tsx` | `AppSidebar` | `Sidebar` + `SidebarHeader` (logo/brand) + `NavMain`; sidebar nav data defined inline |
| `nav-main.tsx` | `NavMain` | renders one `SidebarGroup`/`SidebarGroupLabel`/`SidebarMenu` per module group; `isActive` for the current route, placeholder modules disabled |
| `site-header.tsx` | `SiteHeader` | `SidebarTrigger`, breadcrumb, notification/help buttons, user dropdown |

There is no `app-shell.tsx` wrapper: the `_app/route.tsx` layout component composes `SidebarProvider` → `AppSidebar` + `SidebarInset` (`SiteHeader` + `<Outlet />`) directly — pure declarative composition with zero business logic, which preserves Principle I's intent for route files (a pathless layout has no feature page to point at).

## Complexity Tracking

No constitution violations to justify — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| —         | —          | —                                    |
