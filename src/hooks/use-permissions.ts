import { useQuery } from "@tanstack/react-query"

import { currentPermissionsQueryOptions } from "@/features/auth/api/options"
import { hasPermission } from "@/features/auth/permissions"
import type { PermissionCode } from "@/lib/types/permission.type"

/** The signed-in user's effective permission codes (empty until loaded). */
export function usePermissions(): string[] {
  const { data } = useQuery(currentPermissionsQueryOptions)

  return data ?? []
}

/** Whether the signed-in user satisfies `required` (superadmin passes all). */
export function useHasPermission(
  required: PermissionCode | PermissionCode[]
): boolean {
  return hasPermission(usePermissions(), required)
}
