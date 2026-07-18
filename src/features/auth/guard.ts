import { redirect } from "@tanstack/react-router"

import { hasPermission } from "@/features/auth/permissions"
import { getCurrentSession } from "@/features/auth/server-functions/get-current-session"
import type { CurrentSession } from "@/features/auth/types/login.type"
import type { PermissionCode } from "@/features/auth/types/permission.type"

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
 * Route-level authorization. Call from a route's `beforeLoad` with the
 * permissions from the `(authed)` layout context. Missing permission bounces to
 * the dashboard — the backend permission guard is still the real enforcement.
 */
export function requirePermission(
  permissions: string[],
  required: PermissionCode | PermissionCode[]
): void {
  if (!hasPermission(permissions, required)) {
    throw redirect({ to: "/manage" })
  }
}
