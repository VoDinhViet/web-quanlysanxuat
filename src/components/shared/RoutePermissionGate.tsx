import type { ReactNode } from "react"

import { hasPermission } from "@/features/auth/permissions"
import { requiredPermissionForPath } from "@/features/auth/route-permissions"
import { usePermissions } from "@/hooks/use-permissions"
import type { ManageRoutePath } from "@/features/auth/route-permissions"

type RoutePermissionGateProps = {
  route: ManageRoutePath
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Renders `children` when the signed-in user may open `route` (superadmin passes all),
 * else `fallback` (defaults to nothing). Use to gate a link/button that navigates to a
 * `/manage` route — it reads the same access map the router guard reads, so the gate can
 * never disagree with the route it links to. For a gate keyed on an action rather than a
 * destination route (e.g. `orders:approve` on an `orders:read` page), use `PermissionGate`
 * instead.
 */
export function RoutePermissionGate({
  route,
  children,
  fallback = null,
}: RoutePermissionGateProps) {
  const permissions = usePermissions()
  const required = requiredPermissionForPath(route)

  return required === null || hasPermission(permissions, required) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  )
}
