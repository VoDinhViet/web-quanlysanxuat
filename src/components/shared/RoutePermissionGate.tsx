import type { ReactNode } from "react"

import { useQuery } from "@tanstack/react-query"

import { currentPermissionsQueryOptions } from "@/features/auth/api"
import { hasPermission } from "@/lib/permissions"
import {
  isRouteAvailable,
  requiredPermissionForPath,
} from "@/lib/route-permissions"
import type { ManageRoutePath } from "@/lib/route-permissions"

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
  const { data: permissions } = useQuery(currentPermissionsQueryOptions)
  const required = requiredPermissionForPath(route)

  return isRouteAvailable(route) &&
    (required === null || hasPermission(permissions ?? [], required)) ? (
    <>{children}</>
  ) : (
    <>{fallback}</>
  )
}
