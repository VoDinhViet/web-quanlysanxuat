/**
 * Mirror of the backend permission catalogue
 * (`be-quanlysanxuat/src/constants/permission.constant.ts`). Permissions are
 * `resource:action` strings granted to a role; `system:manage` is superadmin
 * god-mode and bypasses every check. Keep this list in sync with the backend.
 */
export const PERMISSION_CODES = [
  "system:manage",

  "users:create",
  "users:update",

  "roles:read",
  "roles:create",
  "roles:update",
  "roles:delete",

  "clients:read",
  "clients:create",
  "clients:update",
  "clients:delete",

  "products:read",
  "products:create",
  "products:update",
  "products:delete",
  "products:copy",

  "materials:read",
  "materials:create",
  "materials:update",
  "materials:delete",

  "suppliers:read",
  "suppliers:create",
  "suppliers:update",
  "suppliers:delete",
] as const

export type PermissionCode = (typeof PERMISSION_CODES)[number]

/** Any role holding this passes every authorization check (superadmin). */
export const SUPER_PERMISSION: PermissionCode = "system:manage"
