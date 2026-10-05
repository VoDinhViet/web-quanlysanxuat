## Language boundaries

- Domain values are language-neutral in code (`"active"`, not `"Hoạt động"`) and mapped
  to Vietnamese labels at the display edge via a `Record<Enum, string>` — see
  `userStatusLabels`-style maps in `src/lib/types/*.type.ts` files.
- Server-function error messages are Vietnamese strings written directly in each
  `resolve<Thing>ErrorMessage` switch (see `src/features/auth/api/server-functions/login-with-email-password.api.ts`); never
  surface a raw backend/HTTP error string to the UI.
- "UI text is Vietnamese" covers every user-visible surface, not just feature pages:
  `<html lang="vi">`, the document `<title>`, and the root `notFoundComponent`
  (`src/routes/__root.tsx`) too. Don't leave template-default English in place.

## Naming

- An `id`-shaped function parameter or callback prop names the entity it identifies
  (`revisionId`, `userId`, `productId`) instead of the bare `id` — e.g.
  `onEdit: (revisionId: string) => void`, not `onEdit: (id: string) => void`. A call site
  like `onEdit(revision.id)` should be self-documenting from the type alone, without
  checking the component that defines it. Exception: a component's own `id` prop for a
  single obvious subject (e.g. `type UserRowProps = { id: string }`) can stay `id` — the
  rule is about disambiguating _which_ id once a component or callback deals with more
  than one kind of entity.
- Name a variable after what it holds, not after its shape: no generic `rows`, `row`,
  `data`, `result`, `list` for query results, table data or intermediate values — write
  `lastPurchases`, `unfulfilledOrderItems`, `requisitionLines`. A collection takes the
  plural of its entity, a callback parameter the singular (`(purchase) => ...`), never
  `r`/`x`. A lookup `Map` is `<value>By<Key>` (`supplierById`). Apply it to code you touch
  or add; don't rename unrelated variables in the same change.
- Module-scope constants use `camelCase` (`quickAccessTiles`, `orderStatusLabels`,
  `mockRows`) — same as every label map in `src/lib/types/*.type.ts`.
  `SCREAMING_SNAKE_CASE` is reserved for actual configuration/infrastructure constants
  (`API_BASE_URL`, `HTTP_TIMEOUT_MS`, `SESSION_MAX_AGE_SECONDS`, `MOBILE_BREAKPOINT`,
  `MAX_*_SIZE_BYTES`, `PERMISSION_CODES`) and for `GENERIC_ERROR_MESSAGE` in each
  `*.api.ts`. `src/components/ui/` is shadcn-generated and keeps whatever shadcn wrote.

## Simplicity

- Don't introduce an abstraction until the third use.
- Split components over ~150 lines and functions over ~40 lines or 3 levels of nesting.
- Keep call sites simple and their intent obvious. An expression that needs a second read
  (chained or conditional spreads, filter + dedupe, nested ternaries) becomes a small named
  function — pure, non-exported, module scope, in the file that uses it. A single-use helper is
  fine: it names logic, it isn't an abstraction for reuse. Once a second file needs it, check
  `src/lib/utils.ts` first, then promote it there (or to the feature's `constants/` if it
  carries domain logic). Don't wrap trivial one-liners (`a ?? b`, `items.length > 0`).
- Pick the first construct that fits:

  | Situation                               | Use                                                                                        |
  | --------------------------------------- | ------------------------------------------------------------------------------------------ |
  | One value vs several constants          | `editableStatuses.includes(status)` — a named list, not a chain of `===` checks            |
  | Same check inside a loop / large list   | `Set.has()` — build the `Set` once outside the loop                                        |
  | Value → label/config/handler            | Object lookup: `priorityColors[priority]`, `rowActionHandlers[action](id)`, not a `switch` |
  | Nullable value / default                | `?.`, `??`, `??=` (`filters.page ??= 1`)                                                   |
  | Any / all / first match in a collection | `.some()` / `.every()` / `.find()`, not a `for` loop with a flag and `break`               |
  | Transform a collection                  | `.map()` / `.filter()`, not `push` into a `let` array                                      |
  | Optional key / item in a literal        | `...(q !== undefined && { q })`, `...(canApprove ? [approveAction] : [])`                  |
  | Several business preconditions          | Early return (or throw) per failed guard; happy path stays unindented                      |
  | Branches with several statements        | `switch`                                                                                   |

  Details that bite:

  - Type lookups as `Record<Enum, X>` so `tsc` flags a missing key when the enum grows; for an
    open string key use `Partial<Record<string, X>>` with a fallback (`unitLabels[unit] ?? "Khác"`)
    or `handlers[action]?.()`. Build a handler map inside the component when handlers close over
    its state.
  - Prefer `??=` over `||=` for business data — `||=` also overwrites `0`, `false` and `""`. Use
    either only on a local object you own, never on props, query data or `useSearch()` results.
  - `.every()` is `true` on an empty array — guard with `items.length > 0 &&` when "no items"
    must not count as "all done". Use `.includes()` for a plain value, not `.some((x) => x === v)`.
  - `q && { q }` drops the key for every falsy value; use `q !== undefined` when `0`/`""` matter.
  - Keep `if`/`else` for ranges and compound conditions (`quantity > 100`, `isOwner && draft`).
    `resolve<Thing>ErrorMessage` stays a `switch` on `errorCode` per `data-layer.md`.

- Delete dead code in the same change that makes it dead — don't leave unused drafts
  behind (e.g. an unused component superseded by one in `components/shared/`).
- Conditional JSX with no real "else" branch uses `cond && <JSX />`, not
  `cond ? <JSX /> : null` — the ternary's `: null` is dead weight once there's nothing to put in
  its place. Keep the ternary when there's a genuine second branch to render (`cond ? <A/> : <B/>`)
  or when `cond` isn't already a safe boolean — `count && <Badge/>` renders the literal `0` when
  `count` is `0`; guard with `count > 0 && <Badge/>` (or an explicit ternary) instead.
- No new dependency without approval. No inline `eslint-disable`.
