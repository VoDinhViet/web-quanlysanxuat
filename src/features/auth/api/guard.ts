import { redirect } from "@tanstack/react-router"

import { currentSessionQueryOptions } from "@/features/auth/api/options"
import { hasPermission } from "@/lib/permissions"
import { resolveInternalRedirect } from "@/lib/redirect"
import { requiredPermissionForPath } from "@/lib/route-permissions"
import type { CurrentSession } from "@/lib/types/login.type"
import type { QueryClient } from "@tanstack/react-query"
import type { MakeRouteMatchUnion } from "@tanstack/react-router"

/**
 * The single place that decides whether a protected route may render. Called from the
 * `(authed)` layout's `beforeLoad` so every route nested under it inherits the guard —
 * do not duplicate this check elsewhere (see CLAUDE.md "Layer boundaries"). Reads the
 * session through `currentSessionQueryOptions` via `query({ ...options, staleTime: "static" })`
 * — a read-through that returns whatever's cached and only fetches on a true cache miss —
 * rather than calling the server function directly. An uncached round trip on every navigation
 * used to push `beforeLoad` past `defaultPendingMs` and remount the whole sidebar shell (see
 * `(authed)/route.tsx`).
 */
export async function requireSession(
  location: { href: string },
  queryClient: QueryClient
): Promise<CurrentSession> {
  try {
    return await queryClient.query({
      ...currentSessionQueryOptions,
      staleTime: "static",
    })
  } catch {
    throw redirect({
      to: "/login",
      search: { redirectTo: location.href },
    })
  }
}

/**
 * `/login` for someone who already holds a valid session: send them on instead of showing the
 * form again. Revalidates (`staleTime: 0`) rather than reading through the cache like
 * `requireSession` — the idle-tab watchdog redirects here on expiry without touching that cache
 * entry, so a cached read would bounce an expired session straight back into the app.
 */
export async function redirectIfAuthenticated(
  redirectTo: string | undefined,
  queryClient: QueryClient
): Promise<void> {
  try {
    await queryClient.query({
      ...currentSessionQueryOptions,
      staleTime: 0,
      retry: false,
    })
  } catch {
    return
  }

  throw redirect({ href: resolveInternalRedirect(redirectTo) })
}

/**
 * Route-level authorization for the whole authenticated app, run once from the `(authed)`
 * layout's `beforeLoad`. `matches` is the full match array for the destination — including
 * the child routes about to render — so a single check covers every page; no route under
 * `(authed)` needs its own guard (see `route-permissions.ts`). Missing permission bounces to
 * the dashboard — the backend permission guard is still the real enforcement.
 */
export function requireRoutePermissions(
  permissions: string[],
  matches: ReadonlyArray<MakeRouteMatchUnion>
): void {
  const required = matches
    .map((match) => requiredPermissionForPath(match.fullPath))
    .filter((code) => code !== null)

  if (!hasPermission(permissions, required)) {
    throw redirect({ to: "/manage" })
  }
}
