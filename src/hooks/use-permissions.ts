import { useQuery } from "@tanstack/react-query"

import { currentPermissionsQueryOptions } from "@/features/auth/api"
import { hasPermission } from "@/lib/permissions"
import type { PermissionCode } from "@/lib/types/permission.type"

/** Whether the signed-in user satisfies `required` (superadmin passes all). */
export function useHasPermission(
  required: PermissionCode | PermissionCode[]
): boolean {
  const { data: permissions } = useQuery(currentPermissionsQueryOptions)

  return hasPermission(permissions ?? [], required)
}
