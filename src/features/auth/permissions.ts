import { SUPER_PERMISSION } from "@/features/auth/types/permission.type"
import type { PermissionCode } from "@/features/auth/types/permission.type"

/**
 * Whether `granted` satisfies `required`. Mirrors the backend guard: a superadmin
 * (holding `system:manage`) passes everything; otherwise ALL required codes must
 * be present. `granted` is typed loosely (`string[]`) because it comes off the
 * wire from `/api/users/me`.
 */
export function hasPermission(
  granted: string[],
  required: PermissionCode | PermissionCode[]
): boolean {
  if (granted.includes(SUPER_PERMISSION)) {
    return true
  }

  const codes = Array.isArray(required) ? required : [required]

  return codes.every((code) => granted.includes(code))
}
