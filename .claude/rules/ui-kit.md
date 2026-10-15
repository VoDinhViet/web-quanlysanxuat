---
paths:
  - "src/components/**"
  - "src/features/*/components/**"
---

## Principle

> **Shared components own the shell**: layout, spacing, state machine, markup, the _shape_ of
> query/mutation plumbing.
> **The domain owns the content**: columns, Vietnamese labels, status→tone maps, query keys,
> business gates.

Test before writing a new component: _remove the entity name from the file — is anything still
specific?_ Nothing left → `src/components/shared/`; real lifecycle/business logic left → stays in
the feature.

Every component — in `src/components/shared/` or `src/features/<domain>/components/` — belongs to
exactly one of four layers:

- `layouts/` — contains other sections.
- `sections/` — a page region, usually owns query/form state.
- `composites/` — primitives assembled into a reusable unit, not occupying a fixed region.
- `primitives/` — everything else.

The kit grows incrementally: each piece ships in the same commit as one migration that proves it;
no file lands unused. When another feature needs a component below, import it directly, don't
rewrite it.

**The kit serves only `inventory-requisitions`** (except `TimelineCard`/`StatusNotice`, already
used by several features). Moving `purchase-requests` onto `StatusBadge`,
`ConfirmActionDialog`/`ReasonDialog` and `DetailHeader` was requested to be reverted — **do not
migrate more features into the kit, and do not add another feature's component to this table
without asking first.**

## Existing components

| Layer         | Component                  | Main props                                                                                                                                                      |
| ------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `layouts/`    | `PageShell`                | `title`, `breadcrumbs: PageTitleBreadcrumb[]` (only the crumbs after "Bảng điều khiển", which is added automatically), `children`                               |
| `layouts/`    | `PageBody`                 | `className?`, `children` — `flex flex-col gap-4` always on                                                                                                      |
| `layouts/`    | `DetailColumns`            | `main`, `sidebar`, `className?` — sidebar fixed at 320px (matches `inventory-requisitions`; add a `sidebarWidth` prop when a second domain needs another width) |
| `layouts/`    | `WizardStepsTabs`          | `steps: {value, label, icon, disabled?}[]` — draws only `TabsList`/`TabsTrigger`; the `Tabs` root and `TabsContent` stay in the form                            |
| `sections/`   | `TableQueryBoundary`       | `query`, `loadingRows`, `children: (data) => ReactNode` (render-prop so `data` narrows inside the component)                                                    |
| `composites/` | `TimelineCard`             | `icon`, `title`, `steps: TimelineStep[]`, `variant?: "circle"\|"dot"`, `noteToneClassName?`                                                                     |
| `composites/` | `Pagination`               | `page`, `pageSize`, `total`, `onPageChange`, `onPageSizeChange?`, `disabled?`, `className?`, `container?` — purely presentational, always shown                 |
| `composites/` | `StatusLegend`             | `icon`, `title`, `items: {key, badge: ReactNode, description}[]`                                                                                                |
| `composites/` | `StatusNotice`             | `title`, `reason`, `actorName?`, `timestamp?` (formatted `dd/MM/yyyy HH:mm` internally), `extra?`                                                               |
| `composites/` | `JobOperationReportDialog` | `row: JobOperationReportRow`, `disabledReason: string \| null` (null = can enter), `trigger`; ships with `resolveJobOperationReportDisabledReason(...)`         |
| `primitives/` | `RowActions`               | `children`, `className?` — only wraps `flex items-center justify-center gap-1.5`                                                                                |

- `Pagination` does not patch the route itself: list pages with `page`/`limit` in the URL bind it
  through `useRoutePagination` (`src/hooks/use-route-pagination.ts`); local state (a picker in a
  wizard) binds `onPageChange={setPage}` directly.
- `JobOperationReportDialog` is exactly one instance writing exactly one entity
  (`production_job_operations`) through one mutation, rendered by two screens. Its data layer stays
  in `production-jobs`; the shared UI calls back through `@/features/production-jobs/api`.

## Deliberately NOT abstracted

Each feature builds these itself, not through a shared component:

- **`build*Timeline`** — each function carries its own lifecycle rules; only the display shell
  (`TimelineCard`) is shared.
- **Confirm dialogs / dialogs with a reason** (`AlertDialog`/`Dialog` + `useState(open)` +
  `useMutation`) — merged into `ConfirmActionDialog`/`ReasonDialog` once, then reverted.
- **Status badge** (`<Badge>` + dot) — `StatusBadge` was tried and reverted; a badge is not
  guaranteed to keep the same shape in another domain. `Record<XStatus, BadgeStyle>` always lives in
  the feature: deciding which status is "warning"/"destructive" is a product decision.
- **Detail header / info card shell** (back-link + code + badge + meta grid) —
  `DetailHeader`/`SectionCard`/`InfoFields` were tried and reverted; `MetaField`/`InfoRow` are
  private functions at the end of the file.
- **`*TableColumns`**, **`TableEmpty` content** — columns, Vietnamese labels, icon/title always
  live in the feature.
- **`DataTable`**, **`TableFilterBar`/`FilterSelect`**, **`useFilterSearchTerm`** — each had a
  single caller, so they were dropped; each table/filter bar builds its own `Table`/`flexRender`,
  `Select`, `useState` + `useDebounceCallback`.
- **`resetFilters`/`handleXChange`** — closures writing `navigate({search})` keep the route's
  search-schema type; a shared signature would force an `as` cast at every call site.
- **Row-action / Back-button `<Link to params>`** — extracting it would lose route-param type
  checking; keep it as a slot at the call site.
- **`reject-*.schema.ts`** — it is the server function's `.validator()` (trust boundary); don't fold
  it into a shared schema.
- **`*StatCards.tsx`** (`orders`/`iqc`/`suppliers`/`manage`) — the 4 files differ in layout
  (vertical inside a `Card` vs icon beside text) and in the shape of the secondary line (3-tone
  trend / percent / subtitle / toneless trend); one component flexible enough for all four would
  need more variant props than any other kit component, for little gain. Only consider merging
  the 3 horizontal-layout files, without `orders`.
- **`StatusLegend` as `dl`/`dt`/`dd`** (`OrderStatusLegend`, `PurchaseOrderLegend`, …) and
  **`StatusNotice` as shadcn `Alert`** (`orders`/`outbound-orders`) — not yet unified with the kit
  versions (`ul`/`li` + badge via slot; hand-rolled div). Unify when that feature actually
  migrates; the icon package also differs (`@solar-icons/react` vs `lucide-react`).

## Before writing a new component

1. Search `src/components/shared/{layouts,sections,composites,primitives}/` — does this shape
   already exist?
2. Apply the "remove the entity name, what's still specific?" test and pick exactly one of the 4
   layers.
3. Don't land a shared component alone — ship it with one real migration in the same commit.
4. If 2+ copies differ in **structure** (not just class values), don't force them into one
   component with many variant props: merge the similar part first (drop the divergent part), or
   ask.
5. An `as` cast that comes from splitting a component is acceptable if it already existed in the
   original (e.g. `Number(key) as PageSize` in `Pagination`).
