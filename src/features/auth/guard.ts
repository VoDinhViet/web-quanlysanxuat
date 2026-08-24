import { redirect } from "@tanstack/react-router"

import { hasPermission } from "@/features/auth/permissions"
import {
  isRouteAvailable,
  requiredPermissionForPath,
} from "@/features/auth/route-permissions"
import { getCurrentSession } from "@/features/auth/api/server-functions/get-current-session.api"
import type { CurrentSession } from "@/lib/types/login.type"
import type { MakeRouteMatchUnion } from "@tanstack/react-router"

/**
 * The single place that decides whether a protected route may render. Called from the
 * `(authed)` layout's `beforeLoad` so every route nested under it inherits the guard —
 * do not duplicate this check elsewhere (see CLAUDE.md "Layer boundaries").
 */
export async function requireSession(location: {
  href: string
}): Promise<CurrentSession> {
  try {
    return await getCurrentSession()
  } catch {
    throw redirect({
      to: "/login",
      search: { redirectTo: location.href },
    })
  }
}

/**
 * Route-level authorization for the whole authenticated app, run once from the `(authed)`
 * layout's `beforeLoad`. `matches` is the full match array for the destination — including
 * the child routes about to render — so a single check covers every page; no route under
 * `(authed)` needs its own guard (see `route-permissions.ts`). Also bounces a route that
 * isn't available in this build (`isRouteAvailable`, e.g. dev-only) before checking
 * permissions at all. Missing permission bounces to the dashboard — the backend permission
 * guard is still the real enforcement.
 */
export function requireRoutePermissions(
  permissions: string[],
  matches: ReadonlyArray<MakeRouteMatchUnion>
): void {
  if (matches.some((match) => !isRouteAvailable(match.fullPath))) {
    throw redirect({ to: "/manage" })
  }

  const required = matches
    .map((match) => requiredPermissionForPath(match.fullPath))
    .filter((code) => code !== null)

  if (!hasPermission(permissions, required)) {
    throw redirect({ to: "/manage" })
  }
}
