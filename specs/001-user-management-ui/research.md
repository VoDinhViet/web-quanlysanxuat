# Research: User Management UI (Nhân sự)

**Feature**: 001-user-management-ui | **Date**: 2026-07-10

All Technical Context unknowns and design decisions are resolved below. No NEEDS CLARIFICATION remains.

## R1 — Fake data strategy (backend does not exist)

**Decision**: Server functions are real and final; only their data source is fake. A module-level in-memory store (`fake-data.ts`) is created behind an `UserRepository` seam (`repository.ts`) with methods mirroring the future backend capabilities (`list`, `getById`, `create`, `update`, `delete`, `listActivity`). Server functions depend on the repository, never on the store directly. Data is seeded **deterministically** (no `Math.random()`, no faker): ~40 hardcoded-pattern users cycling through the 8 departments and positions from the screenshot (NV001 "Nguyễn Văn An"…), each with 1–3 seeded activity-log entries. A seed-size constant allows a 1,000-record mode for the SC-004 performance check.

**Rationale**: The user directive is "fake data, BE chưa có". Constitution Principle III forces the `ActionResult` + Zod contract regardless of data source, so putting fakes *behind* server functions means zero component changes when the backend arrives — swap `repository.ts` internals to the shared `http` client and delete `fake-data.ts`. In-memory mutation gives real create/edit/delete behavior within a server session, which client-only mocks cannot while honoring Principle III.

**Alternatives considered**: MSW (new dependency, intercepts HTTP that doesn't exist yet — pure overhead); client-side mock arrays (violates Principle III, doubles the later migration cost); JSON file storage (adds fs complexity for no spec requirement — persistence across restarts is explicitly not required in the fake phase); faker/casual libraries (new dependency; deterministic seeds are better for tests anyway).

**Known limitation (accepted)**: the store resets on dev-server restart/HMR of the module. Fine for the fake phase; noted in quickstart.

## R2 — New dependencies: `zod` and `@tanstack/react-form`

**Decision**: Add exactly two dependencies: `zod` and `@tanstack/react-form`. Flag both for user approval in the plan completion report before installing.

**Rationale**: The constitution's stack section names "Zod for validation" and Principle III requires `.validator()` with a Zod schema — the project cannot comply without it. The constitution's form rules reference `field.state.meta.isTouched`, which is the TanStack Form API, so the form library choice is already encoded in governance. The dependency-approval rule still applies, hence the explicit flag.

**Alternatives considered**: hand-rolled validation (violates the constitution's "Zod is the single validation source"); react-hook-form (contradicts the constitution's touched-state contract wording); plain controlled inputs + `safeParse` (workable fallback if TanStack Form is rejected, but re-implements touched/dirty tracking the constitution assumes exists).

## R3 — List state in URL search params

**Decision**: One Zod schema (`user-search-schema.ts`) validates all list state: `page`, `pageSize`, `q` (search), `department`, `position`, `status`, `gender`, `hiredFrom`, `hiredTo` (advanced filter), `selected` (user id for the detail panel), `tab` (`"detail" | "history"`). Every param is optional with `.catch(undefined)` (or `.catch(default)` for page/pageSize) so malformed URLs never crash the route. The route's `validateSearch` uses this schema; components navigate with `Route.useNavigate()` search updates. Any filter/search change resets `page` to 1 in the navigate call.

**Rationale**: Constitution: "Shareable state — filters, pagination, tabs — belongs in Zod-validated URL search params, not `useState`." This also satisfies FR-007/SC-005 (URL restores state) for free, including the selected panel user.

**Alternatives considered**: `useState` + context (violates constitution, breaks shareable URLs); selected user in component state only (would fail SC-005's "exact list state" restoration).

## R4 — Diacritic- and case-insensitive search

**Decision**: Normalize both haystack and needle with `value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()`, plus Vietnamese-specific `đ/Đ → d` replacement (NFD does not decompose đ). Implemented as a small pure helper in the feature, unit-tested with Vietnamese names ("Trần Quốc Huy" matches "tran quoc huy", "huy", "Huy"). Search input is debounced (~300ms) before writing to the URL.

**Rationale**: FR-004 requires diacritic-insensitive matching across name/email/phone/code; the platform `String.normalize` covers it with zero dependencies. Debouncing keeps history/URL churn and server-function calls sane while typing.

**Alternatives considered**: `Intl.Collator` with `sensitivity: "base"` (great for equality/sort, awkward for substring matching); a slug library (unnecessary dependency).

## R5 — Export format and mechanism

**Decision**: Client-side CSV generation. The export button calls the list server function with the current filters and `pageSize: "all"` semantics (a dedicated `forExport` flag returning all filtered rows), builds a CSV string with a **UTF-8 BOM** prefix and CRLF line endings, properly quote-escaped, and triggers a download via a Blob object URL named `nhan-su-YYYY-MM-DD.csv`. Columns: mã nhân viên, họ và tên, phòng ban, chức vụ, email, số điện thoại, trạng thái (Vietnamese labels, since the file is a user-facing artifact).

**Rationale**: Spec assumption allows "Excel/CSV class of output". CSV needs no dependency; the BOM makes Excel open Vietnamese text correctly (without it, Excel mangles UTF-8). Export honors filters because it reuses the same query the table uses (FR-014).

**Alternatives considered**: `xlsx`/SheetJS for real .xlsx (new heavyweight dependency, needs approval, no spec requirement); server-side file generation (pointless while data is fake and in-memory).

## R6 — Status, gender, and label mapping

**Decision**: Domain enums are language-neutral string unions: `UserStatus = "active" | "suspended"`, `Gender = "male" | "female"`. Vietnamese labels live only in `features/users/components/labels.ts` as exhaustive `Record<UserStatus, string>` / `Record<Gender, string>` maps ("Hoạt động", "Tạm ngưng", "Nam", "Nữ"). The status badge maps status → badge variant using semantic tokens (no raw green/orange utilities); the text label always renders alongside the color (FR-003, a11y).

**Rationale**: Constitution: "Domain values are language-neutral (`"active"`, never `"Hoạt động"`)"; exhaustive `Record` makes the compiler catch a missing case when a status is added.

**Alternatives considered**: storing Vietnamese strings in the model (explicitly forbidden); i18n framework (out of scope — the app is Vietnamese-only by charter).

## R7 — Table, pagination, and detail panel composition

**Decision**: Compose from existing `src/components/ui/` primitives only: `table`, `pagination`, `select` (page size + filters), `input-group` (search), `badge`, `avatar` (initials fallback — fake data has **no** avatar image URLs, so `AvatarFallback` with initials renders always), `tabs`, `dialog` (create/edit form), `alert-dialog` (delete confirmation), `dropdown-menu` (row "..." menu), `popover` + `calendar` (advanced filter date range), `empty` (empty states), `skeleton` (loading), `sonner` (toasts), `sidebar` + `breadcrumb` + `tooltip` (app shell). Filtering, sorting, and pagination are computed **in the server function** (the repository), not in the client — the table is a dumb renderer of one page.

**Rationale**: Everything needed already exists in the repo — the dependency rule says check `package.json` first. `@tanstack/react-table` would add client-side table state that contradicts the server-side pagination model (and it isn't installed). Server-side pagination is what the real backend will do, keeping the fake phase behaviorally identical.

**Alternatives considered**: `@tanstack/react-table` (new dependency; wrong layer for server-paginated data); TanStack `Sheet` for detail (screenshot shows a persistent inline panel, not an overlay — panel renders as a fixed-width column next to the table).

## R8 — Route path and app shell placement

**Decision**: Route path is `/users` under a pathless layout `_app` that renders the shell; `/` redirects to `/users` until a dashboard feature exists. The shell (sidebar, header, breadcrumb) lives in `src/components/shared/app-shell/` with files named per the shadcn sidebar block convention (user-confirmed): `app-sidebar.tsx` (`AppSidebar`), `nav-main.tsx` (`NavMain`), `site-header.tsx` (`SiteHeader`) — no invented wrapper names, and the sidebar nav data is defined inline in `app-sidebar.tsx` as shadcn blocks do. Only the Nhân sự item navigates — every other item renders as a disabled/placeholder entry pointing nowhere (no dead 404 links). **The sidebar is built on the shadcn `ui/sidebar` primitives** (user-confirmed): `SidebarProvider` wraps the layout in `_app/route.tsx` (pure composition, no business logic), `AppSidebar` composes `Sidebar` → `SidebarHeader` (logo/brand) → `SidebarContent` where `NavMain` renders one `SidebarGroup` + `SidebarGroupLabel` per module group (TỔNG QUAN, QUẢN LÝ BÁN HÀNG, …) with `SidebarMenu`/`SidebarMenuButton` items (`isActive` for Nhân sự), the main area sits in `SidebarInset` under `SiteHeader`, and the "Thu gọn" collapse behavior uses the built-in `SidebarTrigger`/collapsible state — no hand-rolled sidebar CSS or state.

**Rationale**: Constitution language boundary — identifiers English (URLs behave as identifiers; Vietnamese lives in labels). The shell is cross-module chrome, which Principle I sends to `src/components/shared/` (it is not a feature and features may not import each other). Placeholder nav items honor the spec assumption "other modules are navigation placeholders".

**Alternatives considered**: `/nhan-su` path (mixes Vietnamese into identifiers); building the shell inside the users feature (would force feature-to-feature imports the day module #2 arrives — a Principle I violation by construction).

## R9 — Activity history content (fake phase)

**Decision**: Activity-log entries are seeded per user and appended automatically by the fake repository on create/update/delete/status change: `{ id, userId, action, description (Vietnamese), actor, occurredAt }`, returned newest-first by `listActivity`. Timestamps are seeded relative to fixed anchor dates (deterministic).

**Rationale**: FR-009 requires what/who/when in reverse chronological order; making the fake repository write log entries on mutations means the tab is genuinely live (edit a user → history grows), which validates the UX honestly rather than with static lorem data.

**Alternatives considered**: static-only seeded logs (misses the live-update behavior the real system will have).

## R10 — Session guard follow-up (Principle IV)

**Decision**: No auth exists in the app yet, so `_app/route.tsx` ships without a `beforeLoad` session guard **in this feature**. This is recorded as an explicit obligation: the future auth feature MUST add the guard to the `_app` layout route, which then covers `/users` and all subsequent module routes at once.

**Rationale**: Principle IV binds "authenticated routes"; no route can be authenticated before a session mechanism exists. Centralizing the future guard on the pathless layout is the smallest correct change later.

**Alternatives considered**: stubbing a fake session now (fake auth is security theater and out of spec scope).
