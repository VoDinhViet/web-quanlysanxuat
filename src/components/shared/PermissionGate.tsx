import type { ReactNode } from "react"

import { useHasPermission } from "@/hooks/use-permissions"
import type { PermissionCode } from "@/lib/types/permission.type"

type PermissionGateProps = {
  permission: PermissionCode | PermissionCode[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Renders `children` when the signed-in user holds `permission` (superadmin passes
 * all), else `fallback` (defaults to nothing). Use for permission-gated action
 * buttons (create/update/delete) or to swap in a read-only view. The backend still
 * enforces authorization — this only hides UI the user can't use.
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  return useHasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
