import type { ReactNode } from "react"

import { useHasPermission } from "@/hooks/use-permissions"
import type { PermissionCode } from "@/features/auth/types/permission.type"

type PermissionGateProps = {
  permission: PermissionCode | PermissionCode[]
  children: ReactNode
}

/**
 * Renders `children` only when the signed-in user holds `permission` (superadmin
 * passes all). Use for permission-gated action buttons (create/edit/delete). The
 * backend still enforces authorization — this only hides UI the user can't use.
 */
export function PermissionGate({ permission, children }: PermissionGateProps) {
  return useHasPermission(permission) ? <>{children}</> : null
}
