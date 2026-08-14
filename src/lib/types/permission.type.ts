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

  "orders:read",
  "orders:create",
  "orders:update",
  "orders:approve",

  "production:read",
  "production:create",
  "production:update",
  "production:approve",

  "clients:read",
  "clients:create",
  "clients:update",
  "clients:delete",

  "items:read",
  "items:create",
  "items:update",
  "items:copy",
  "items:bom-manage",

  "operations:read",

  "suppliers:read",
  "suppliers:create",
  "suppliers:update",
  "suppliers:delete",

  "inventory:read",
  "inventory:create",
  "inventory:update",
  "inventory:delete",

  "purchase-requests:read",
  "purchase-requests:create",
  "purchase-requests:update",
  "purchase-requests:approve",

  "purchasing:read",
  "purchasing:create",
  "purchasing:update",
  "purchasing:delete",
  "purchasing:approve",

  "iqc:read",
  "iqc:create",
  "iqc:update",
] as const

export type PermissionCode = (typeof PERMISSION_CODES)[number]

/** Any role holding this passes every authorization check (superadmin). */
export const SUPER_PERMISSION: PermissionCode = "system:manage"
