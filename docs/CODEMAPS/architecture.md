<!-- Generated: 2026-10-16 | Files scanned: 41 | Token estimate: ~4300 -->
# Architecture codemap (web)

**Stack:** TanStack Start (SSR, Vite) + TanStack Router (file-based) + TanStack Query v5 + TanStack Form/Table v9, Zod 4, axios, Tailwind 4, pnpm, Node 24. All UI text Vietnamese, all code English. BE twin: `be-quanlysanxuat/docs/CODEMAPS/architecture.md`. Domain maps: `identity-access.md`, `integration.md`, routes in `routes.md`. Rules: `CLAUDE.md`, `.claude/rules/*.md`.
**Size:** 37 feature folders, 270 server functions (`*.api.ts`), 119 `*.options.ts`, 125 route files, `src/routeTree.gen.ts` generated (never edit).

## Entry points
| File | Role |
|---|---|
| `vite.config.ts` | plugins `tanstackStart()`, `viteReact()`, tailwind, devtools; `@/*` -> `src/*` via tsconfig paths |
| `src/router.tsx` | `getRouter()`: the only `QueryClient` (staleTime 30s, gcTime 15min, retry 1, no refetch on focus), `setupRouterSsrQueryIntegration`, `defaultPreload: "intent"`, `defaultStaleTime: 0`, shared pending/error/not-found components |
| `src/routes/__root.tsx` | `createRootRouteWithContext<{queryClient}>`; `shellComponent` = `<html lang="vi">`, `ThemeProvider`, react-aria `I18nProvider vi-VN`, `Toaster`, devtools; imports `@/lib/luxon-config` |
| `src/routes/index.tsx` | `/` -> redirect `/manage` |
| `server.mjs` | production Node server: static `dist/client` (hashed `/assets/` immutable) + forwards everything else to `dist/server/server.js` fetch handler (SSR + server-fn RPC) |

## Trust boundary
Browser never calls the BE JSON API. Every read/write is a `createServerFn` (runs on the Node server) that calls BE through `src/lib/http.ts`. Tokens live only in the server-side session cookie.
```
component/loader -> queryOptions.queryFn -> serverFn() --RPC /_serverFn--> handler
   handler: .validator(zod) -> http.get/post/patch (axios, baseURL = VITE_API_URL, 30 s)
        request interceptor: getAppSession() -> Authorization: Bearer <accessToken>
        response 401 (not /api/auth/*, once per config): refreshAccessToken() -> replay
   catch: logHttpError(error, "fnName") -> throw new Error(<hand-written Vietnamese message>)
BE JSON error = ApiErrorResponse {timestamp, statusCode, error, errorCode "<domain>.error.<reason>", message, details?[{property,code,message}]}
```
| File | What it holds |
|---|---|
| `src/lib/http.ts` | `http` axios instance, interceptors, `ApiErrorResponse` type, `logHttpError(error, context)` (console only, structured) |
| `src/lib/constants.ts` | `API_BASE_URL = import.meta.env.VITE_API_URL \|\| ""`, `HTTP_TIMEOUT_MS = 30_000` (kept out of `http.ts` to avoid an import cycle with `access-token.server.ts`) |
| `src/lib/access-token.server.ts` | `refreshAccessToken()` with its own interceptor-free client, per-session in-flight map; `isAccessTokenExpired` (60 s skew) |
| `src/lib/session.server.ts` | `getAppSession()`: `iron-session` `getIronSession` over Start's `getCookie`/`setCookie` (Start 1.169 removed `useSession`), cookie `app-session`, httpOnly, sameSite lax, `secure` in production, 7 d ttl, session cookie when `persist: false` (flag stored in the session, so refresh preserves it), absolute `sessionExpires` enforced in `getCurrentSession`, `refreshAccessToken` and the http interceptor (`isSessionExpired`); same-request writes are mirrored so a re-read after refresh is fresh; needs `SESSION_SECRET` |
| `src/lib/jwt.server.ts` | `decodeJwtExpiry` (no signature check; used only to schedule refresh) |
| `src/lib/types/session.type.ts` | `AppSessionData {userId, accessToken, refreshToken, tokenExpires}` |

Rules each server fn follows (`.claude/rules/data-layer.md`): validate input with Zod, explicit return type, try/catch with `logHttpError` + clean message, own `resolve<Fn>ErrorMessage` switching on `errorCode` with `default`, never surface raw BE strings. Details of login/refresh/logout in `identity-access.md`.

## Route layout and guards
```
src/routes/
  __root.tsx
  index.tsx                      "/" -> /manage
  (auth)/route.tsx  AuthLayout   pathless group, only /login inside
  (authed)/route.tsx AuthedLayout  beforeLoad guard + sidebar shell + shared errorComponent
  (authed)/manage.tsx            /manage dashboard (own beforeLoad + loader)
  (authed)/manage_/<slug>/...    every other /manage/* page
```
- `(auth)` and `(authed)` are pathless route groups: not in the URL, but their `route.tsx` is a real layout (route id `"/(authed)"`).
- Trailing underscore = escape nesting. `manage_` keeps URL `/manage/...` but pages do not render inside the dashboard `manage.tsx`; `orders_/$orderId.tsx` keeps `/manage/orders/$orderId` but does not render inside the `orders/route.tsx` list layout; `$orderId_.update.tsx` keeps `.../$orderId/update` outside the detail page.
- List folder = `<slug>/route.tsx` (layout: `PageTitleBar` or `PageShell` + `<Outlet/>`, no loader) + `<slug>/index.tsx` (`validateSearch`, `loader`, `pendingComponent: PagePending`). Leaf pages (`$id`, `create`, `update`) are flat files with `pendingComponent: LayoutPagePending` (`PagePending` is content-only, `LayoutPagePending` also draws a header placeholder). Redirect-only routes: `/manage/units`, `/manage/operations` -> `/manage/settings/*`; `/manage/settings` index.

Guard flow (`src/routes/(authed)/route.tsx`):
```
beforeLoad({location, context, matches})
  requireSession(location, queryClient)     query(currentSessionQueryOptions, staleTime "static") -> else redirect /login?redirectTo=<href>
  Promise.all: query(currentPermissionsQueryOptions), query(currentUserQueryOptions)   (both staleTime "static")
  requireRoutePermissions(permissions, matches)   src/features/auth/api/guard.ts
        codes = matches.map(requiredPermissionForPath(match.fullPath)) -> hasPermission(all) else redirect /manage
  return {user, permissions}               -> child beforeLoads read context.permissions
```
Permission map is `src/lib/route-permissions.ts` (exhaustive over `ManageRoutePath`, typecheck enforces a new `/manage/*` route has an entry); model and gates in `identity-access.md`. Any loader error bubbles to the `(authed)` `errorComponent` (full-screen message + "Thử lại" calling `router.invalidate()`); routes outside `(authed)` use `DefaultCatchBoundary`.

## Data flow
```
Route loader (location.search parsed with the page's searchSchema; `.parse(location.search)` in 30 routes, `loaderDeps` in 1)
   context.queryClient.query({...xQueryOptions(search), staleTime: "static"})   blocking first paint
   void context.queryClient.query(yQueryOptions()).catch(noop)                  secondary, non-blocking
        |
        v  src/features/<f>/api/options/<x>.options.ts   queryOptions({queryKey:[<f>,"list",search], queryFn})
        v  src/features/<f>/api/server-functions/<verb-noun>.api.ts   createServerFn
        v  http (Bearer)  ->  BE /api/...
Page component: useQuery({...xQueryOptions(search), placeholderData: keepPreviousData})  (lists)
                useSuspenseQuery(xQueryOptions(id))                                        (detail, read once at the Page)
Mutation: useMutation({mutationFn: useServerFn(fn)}) -> onSuccess invalidateQueries({queryKey:[<f>]}) (+ other features that read it)
          onError: toast.error(error.message)
```
Query keys: `[<feature>]` root, `[<f>,"list",search]`, `[<f>,"detail",id]`, `[<f>,"options",...]`. Freshness tiers: 30 s default, reference options 5-15 min, hot screens 0. The pending-approvals badge and the session watchdog poll on their own.

## Lists, tables, forms
| Concern | Where / how |
|---|---|
| URL as state | Zod `validateSearch` per list route, every param `.catch(default)`; schema file `schemas/<x>-search.schema.ts` mirrors BE `PageOptionsDto` (`page`, `limit` 10/20/50, `q`, `order`) + filters; `useSearch({from: "<route id>"})` |
| Pagination | `src/components/shared/composites/Pagination.tsx` (presentational) + `src/hooks/use-route-pagination.ts` (`navigate({to:".", search})`, resets `page` to 1 on size change) |
| Tables | TanStack Table v9, one shared feature set `appTableFeatures` in `src/lib/table-features.ts`; sorting/filter/pagination are server-driven via URL; states via `TableQueryBoundary`, `TableQueryLoading`, `TableQueryError`, `TableEmpty` |
| Forms | `useAppForm`/`withForm` from `src/hooks/use-app-form.ts` (TanStack Form `createFormHook`; fields in `composites/AppFormFields.tsx`: Text, Number, Textarea, Date, Password, RadioPill, Select, Switch); `revalidateLogic()` + schema on `validators.onDynamic`; only `orders` (`CreateOrderForm`/`UpdateOrderForm`) uses react-hook-form (trial; `forms-and-ui.md` also names `users`, but `src/features/users` has no react-hook-form import) |
| Schemas | `create-x.schema.ts` and `update-x.schema.ts` are separate; the same schema validates the form and the server fn; wire mapping via `.transform()` in the server fn; file ids via `src/lib/file-field.schema.ts` |
| Drafts | `src/hooks/use-form-draft.ts` (zustand persist -> localStorage, hydrated after mount) |
| Shared UI | `src/components/ui` (shadcn), `src/components/shared/{layouts,composites,primitives,sections}`, permission gates in `primitives/` |

## Feature folder convention
`src/features/<domain>/` = vertical slice: `api/` (`server-functions/*.api.ts`, `options/*.options.ts` + `options/index.ts`, `index.ts` barrel, optional `use-*.ts` hooks), `components/`, `constants/`, `hooks/`, `pages/`, `schemas/`. Domain types, enums and `*Labels` maps: `src/lib/types/<name>.type.ts`.
- Names: components/pages PascalCase; everything else kebab-case; suffixes `.api.ts` (one `createServerFn`), `.options.ts` (one factory), `.schema.ts`, `.type.ts`; `use-*.ts` hooks. Route files only compose: `createFileRoute`, `validateSearch`, `beforeLoad`, `loader`, `pendingComponent`, `component` pointing at a page.
- Cross-feature reads only through `@/features/<other>/api` barrel (queryOptions factories and option hooks, never raw server fns). Enforced by ESLint rules `qlsx/feature-boundary/*`, `qlsx/lib-is-feature-agnostic`, `qlsx/shared-reads-features-through-the-barrel`, `qlsx/routes-compose-pages`, `qlsx/api-barrel-surface` in `eslint.config.js`.
- api-only features (no `pages/`): `countries`, `positions`, `reports`; `inventory-adjustments` has only `schemas/`.

## Environment and deploy
| Item | Detail |
|---|---|
| `VITE_API_URL` | public, inlined into the browser bundle at build time (Docker build arg / CI repo variable); empty = same-origin; dev example `http://localhost:8000` |
| `SESSION_SECRET` | server-only, signs the session cookie, read lazily by `getAppSession` (throws if unset) |
| `NODE_ENV` | `production` makes the cookie `Secure` (app then only works over HTTPS) |
| `PORT` (3000), `HOST` (0.0.0.0) | `server.mjs`; `WEB_PORT` is compose-only |
| Dev | `pnpm dev` = `vite dev --port 3000`; `pnpm typecheck`, `pnpm lint`, `pnpm test` (vitest, 2 test files in `src/lib`) |
| `Dockerfile` | node:24-bookworm-slim, pnpm 11.4.0, stages deps -> build (`pnpm build`) -> runner (`dist`, `node_modules`, `server.mjs`, user `node`, `EXPOSE 3000`, `CMD node server.mjs`) |
| `docker-compose.yml` (root) | service `web`, `expose: 3000`, platform proxy reaches it; healthcheck GET `/login` non-5xx |
| `nixpacks.toml` | alternative build, same `pnpm build` + `node server.mjs` |
| `deploy/` | `docker-compose.yml` (VPS, `127.0.0.1:${WEB_PORT}:3000`, Caddy in front) and `remote-deploy.sh` (pull image, `up --wait`, roll back to the previous image on failed healthcheck) |
| `.github/workflows/deploy.yml` | push to `main`: typecheck (blocking) + eslint (warning only) in parallel with image build/push to GHCR, then SSH deploy |

## Add a new screen end-to-end
1. BE first: confirm the endpoint, permission code and DTO in `be-quanlysanxuat` (swagger `:8000/api-docs` or BE codemaps). If a new permission code, add it to `src/lib/types/permission.type.ts` (keep identical to BE `PERMISSION_CODES`).
2. Types and labels: `src/lib/types/<name>.type.ts` (mirror BE enum values, add `*StatusLabels` Vietnamese map).
3. Server fns: `src/features/<f>/api/server-functions/<verb-noun>.api.ts` (validator, `http`, `logHttpError`, `resolve...ErrorMessage`, explicit return type). Create and update schemas in `schemas/`.
4. Options: one `queryOptions` per file in `api/options/`, re-export in `api/options/index.ts`; if another feature needs it, export the factory from `api/index.ts`.
5. Search schema `schemas/<x>-search.schema.ts` for a list (page/limit/q/filters with `.catch`).
6. Page(s) in `pages/` and components in `components/{primitives,composites,sections,layouts}`; list page uses `useQuery` + `keepPreviousData` + `useRoutePagination`; wrap actions in `PermissionGate` or `RoutePermissionGate`.
7. Routes under `src/routes/(authed)/manage_/`: `<slug>/route.tsx` (layout) + `<slug>/index.tsx` (list), `<slug>_/$id.tsx`, `<slug>_/create.tsx`, `<slug>_/$id_.update.tsx`; loader via `queryClient.query({...opts, staleTime: "static"})`; `pendingComponent` `PagePending` (child of layout) or `LayoutPagePending` (leaf).
8. Gate: add each new `/manage/...` path to `routePermissions` in `src/lib/route-permissions.ts` (typecheck fails otherwise).
9. Sidebar: add a `MenuItem` to `menuGroups` in `src/components/shared/layouts/AppSidebar.tsx` (and a `badgeKey` if `pending-approvals` has a count).
10. Mutations: `useMutation` + `useServerFn`, `invalidateQueries({queryKey: [<f>]})` plus every other feature that reads the same data; `toast.error(error.message)`.
11. Let the dev server regenerate `routeTree.gen.ts`; run `pnpm typecheck` and `pnpm lint`. Update `docs/ui-flow.md` and the matching domain codemap.

## Quirks
- Rule text and code differ: `.claude/rules/data-layer.md` shows loaders using `loaderDeps`/`deps`, but 30 route loaders re-parse `location.search` (comments "No loaderDeps"); only `production-execution_/$productionJobId.tsx` declares `loaderDeps`.
- `.claude/rules/project-structure.md` says large features split `components/` into `create/`, `update/`, `detail/`, `list/`; no such folders exist, features use `primitives/composites/sections/layouts`.
- `Dockerfile` header comment still says the runner is `vite preview`; the runner actually uses `server.mjs`.
- `.claude/rules/project-structure.md` still lists `units`, `operations` as api-only; both now have pages (`UnitsPage`, `OperationsPage` under `/manage/settings/*`).
