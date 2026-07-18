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
  "users:delete",

  "roles:manage",

  "orders:create",
  "orders:read",
  "orders:read-production",
  "orders:update",
  "orders:delete",
  "orders:approve",

  "quotations:manage",

  "clients:manage",
  "clients:read",
  "clients:create",
  "clients:update",
  "clients:delete",

  "products:read",
  "products:create",
  "products:update",
  "products:delete",
  "products:lock",
  "products:copy",
  "products:bom-manage",
  "products:routing-manage",

  "material-requests:create",
  "material-requests:read",
  "material-requests:approve",

  "suppliers:read",
  "suppliers:create",
  "suppliers:update",
  "suppliers:delete",
  "suppliers:manage",

  "supplier-shortlists:create",

  "purchase-orders:manage",
  "purchase-orders:approve",

  "warehouse-receipts:create",
  "warehouse-receipts:approve",

  "warehouse-issues:create",
  "warehouse-issues:approve",

  "warehouse-returns:create",
  "warehouse-returns:approve",

  "warehouse-inventory:manage",

  "qc-stock-in-quality:approve",
] as const

export type PermissionCode = (typeof PERMISSION_CODES)[number]

/** Any role holding this passes every authorization check (superadmin). */
export const SUPER_PERMISSION: PermissionCode = "system:manage"
