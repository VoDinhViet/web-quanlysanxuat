---
paths:
  - "src/features/*/api/**"
  - "src/features/*/hooks/**"
  - "src/routes/**"
  - "src/lib/**"
---

## Server functions — the only trust boundary

`src/features/<domain>/api/server-functions/*.api.ts` holds one `createServerFn` per operation;
`api/options/*.options.ts` holds one `queryOptions` factory per file, re-exported from
`api/options/index.ts`. A server function used by one feature lives in that feature; one used
by several lives in its natural owner (`getClientOptions` belongs to `clients`, read by others
via `@/features/clients/api`) or, with no natural owner, becomes an api-only feature.

Pattern (see `src/features/orders/api/server-functions/create-order.api.ts`):

```ts
function resolveDoThingErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.invalid_credentials":
      return "Tài khoản hoặc mật khẩu không đúng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const doThing = createServerFn({ method: "POST" })
  .validator(someZodSchema) // 1. always validate input
  .handler(async ({ data }): Promise<void> => {
    // 2. explicit return type
    try {
      // ... call the backend via the shared `http` client
    } catch (error) {
      logHttpError(error, "doThing") // 3. log once, at the catch
      throw new Error(resolveDoThingErrorMessage(error)) // 4. throw a clean message
    }
  })
```

- On success `return` the plain data (or nothing) — no wrapper object. On failure
  `throw new Error(<hand-written Vietnamese message>)`; a plain `Error` round-trips across the
  RPC boundary intact. Wrap the whole handler body in try/catch.
- The backend returns errors as `ApiErrorResponse` (`src/lib/http.ts`): `errorCode` is
  `<domain>.error.<reason>`; `details` (`property`/`code`/`message`) appears only on
  field-level validation errors.
- Each server function writes its own `resolve<Thing>ErrorMessage`: check
  `axios.isAxiosError<ApiErrorResponse>`, `switch` on `error.response?.data.errorCode`, always
  with a `default`. No shared generic resolver — endpoints return different codes. **Never
  surface `error.response?.data.message` or any raw backend/HTTP string to the UI.** Server
  functions are the only place that reads the raw `AxiosError`/`errorCode`; it must not leak into
  loaders or components.
- Use the shared `http` client (`src/lib/http.ts`). No ad-hoc axios instances.
- **Create and update each get their own schema** (`create-x.schema.ts`, `update-x.schema.ts`),
  each declaring every DTO field directly — no shared `xProfileFields` spread, so the two flows
  evolve independently. Each schema is both the client form's `onSubmit` validator and the
  server function's `.validator()`. Optional fields differ by verb: create uses
  `emptyToUndefined` (POST — omitted key means "not provided"); update uses `emptyToNull` or
  inline number/date variants (PATCH — omitted key means "leave unchanged", so clearing needs
  an explicit `null`; check the backend DTO's `nullable: true` fields). `update-x.schema.ts`
  declares the entity id (`productId: z.uuid()`) as its first field, so the update form owns it.
  Models: `src/features/orders/schemas/` and `src/features/clients/schemas/`.
- Wire-payload mapping happens in the server function's `.validator()`, not the form schema:
  chain a local `.transform()` onto the create/update schema so `data` in `.handler()` is
  already wire-ready. File fields (image/avatar/logo → `*FileId`, attachments →
  `attachmentFileIds`) use `resolveApiFileId`/`resolveApiAttachmentFileIds`
  (`src/lib/file-field.schema.ts`): `undefined` on create (omit the key), explicit `null` on
  update (PATCH treats a missing key as "no change"). See
  `src/features/users/api/server-functions/create-user.api.ts` and `update-user.api.ts`.
- Dates use **luxon** directly at call sites (`DateTime.fromISO(...).toFormat("dd/MM/yyyy")`
  for display, `"yyyy-MM-dd"` for date-picker values) — no wrapper helpers, no second date
  library. Numbers/percentages use `Intl.NumberFormat("vi-VN", ...)` at call sites, not
  `toFixed`/string concatenation (see `src/features/suppliers/components/SupplierStatCards.tsx`).

## Loaders don't catch — errors bubble to a shared `errorComponent`

- A route `loader` prefetches into the query cache and does **not** try/catch. A thrown server
  function rejects the loader and bubbles to the nearest ancestor `errorComponent`.
- There is one shared `errorComponent` for the authenticated app, on
  `src/routes/(authed)/route.tsx`: it replaces the whole shell with a Vietnamese error screen
  and a "Thử lại" button calling `router.invalidate()`. Don't add a per-route `errorComponent`
  unless a route genuinely needs different error UI.
- Exception: `requireSession` in `src/features/auth/api/guard.ts` wraps its cached session read
  in try/catch itself, because an invalid session is a navigation decision
  (`redirect({to: "/login"})`), not an error to display.

## Mutations use `useMutation`

- Every imperative write (login, logout, create/update/delete) uses `useMutation` with the
  server function (bound via `useServerFn`) as `mutationFn` — it already throws on failure.
  Destructure `const { mutate: create, isPending } = useMutation({...})`, wire
  `onError: (error) => toast.error(error.message)` (a `sonner` toast, not an inline `Alert`),
  and read `isPending` for pending UI. See `src/features/auth/components/LoginForm.tsx`.
- `QueryClient` is created once, in `src/router.tsx` (wired via
  `setupRouterSsrQueryIntegration`) — never a second instance. Freshness has three tiers: the
  30s default; reference-option factories (units, clients, operations, ...) override `staleTime`
  upward to a literal 5–15 min; fast-moving screens (stock in `inventory-products`, floor
  progress in `production-execution`) use `0`. The 30s window is only safe because every
  mutation invalidates the feature roots it affects **including other features that read the
  same data** (posting an inventory issue also invalidates `inventory-requisitions` and
  `inventory-products`) — when adding a mutation, check what else reads what it writes.
- After an entity write, `queryClient.invalidateQueries({ queryKey: [<feature>] })` (via
  `useQueryClient`) — **not** `router.invalidate()`, which re-runs every loader. Login/logout
  keep `router.invalidate()` (session change is a router concern). Uploads
  (`src/lib/upload-file.ts`) invalidate nothing: they return a file id plus a display URL into
  form state. Only the id reaches the backend; every `<img src>`/`<a href>` goes through
  `resolveFileUrl` (`src/lib/file-url.ts`).

## Reads flow through React Query (loader prefetch + query cache)

- Every read has a `queryOptions` factory in `api/options/` (e.g.
  `src/features/orders/api/options/orders.options.ts`), imported within the feature from
  `@/features/<domain>/api/options`. The `queryFn` calls the server function directly (no
  `useServerFn` — factories aren't hooks).
- **Query keys:** `[<feature>]` is the root, written as a bare array literal in each factory's
  own file (no shared `.keys.ts`), with `[<feature>, "list", search]`, `[<feature>, "stats"]`,
  `[<feature>, "detail", id]` and reference keys like `[<feature>, "group-options"]` beneath it,
  so one `invalidateQueries({ queryKey: [<feature>] })` refreshes the feature. An api-only
  feature nests under `"options"` (`["units", "options"]`, `["operations", "options", q, type]`).
- **Loaders prefetch, don't return:** `loader: ({context, deps}) =>
context.queryClient.query({...usersQueryOptions(deps), staleTime: "static"})` (several via
  `Promise.all`). `staleTime: "static"` is mandatory: it makes the call a pure read-through
  (return the cache, even stale; fetch only on a true miss), so navigation never blocks on
  revalidation — the mounted `useSuspenseQuery` revalidates using the factory's `staleTime`.
  Without it every loader becomes a blocking refetch after 30s and remounts the sidebar shell
  (see `(authed)/route.tsx`). Secondary, non-blocking data uses the fire-and-forget form
  `void context.queryClient.query(<thing>QueryOptions(...)).catch(noop)` (`noop` from
  `@tanstack/react-query`), which deliberately omits `staleTime: "static"` so it keeps
  revalidating. Don't use `ensureQueryData`/`fetchQuery`/`prefetchQuery` (or infinite variants):
  deprecated in favor of `query()`.
- **Components read via `useSuspenseQuery(<thing>QueryOptions(...))`** for loader-prefetched
  data (resolves synchronously, no Suspense boundary needed). Entity data keyed by a route
  param (`orderQueryOptions(orderId)`) is read once at the Page and passed down as a prop — a
  leaf can't safely re-derive the id (`useParams` throws on a route without it, e.g. the shared
  form on `create`). Fixed-key reference lists (group/country/unit) are read directly by the
  leaf section that renders the select, not threaded through Page → Form; React Query dedupes by
  key (see `src/features/users/components/CreateUserJobInfoSection.tsx`). A value derived from
  an entity (a combobox's `initialOption` from `material.client`) still flows down as a prop.
- **Client-interactive reads a loader can't prefetch** (debounced combobox search,
  `enabled: open` sheets) use plain `useQuery`, spreading the factory and adding observer-only
  options. `select` stays at the `useQuery` call site, never in a factory — `query()` applies
  `select`, so a factory-level one would change what every loader resolves to.
