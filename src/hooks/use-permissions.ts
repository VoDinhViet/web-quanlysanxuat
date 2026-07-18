import { useQuery } from "@tanstack/react-query"

import { currentUserQueryOptions } from "@/features/auth/current-user.query"
import { hasPermission } from "@/features/auth/permissions"
import type { PermissionCode } from "@/features/auth/types/permission.type"

/** The signed-in user's effective permission codes (empty until loaded). */
export function usePermissions(): string[] {
  const { data } = useQuery(currentUserQueryOptions)

  return data?.permissions ?? []
}

/** Whether the signed-in user satisfies `required` (superadmin passes all). */
export function useHasPermission(
  required: PermissionCode | PermissionCode[]
): boolean {
  return hasPermission(usePermissions(), required)
}
