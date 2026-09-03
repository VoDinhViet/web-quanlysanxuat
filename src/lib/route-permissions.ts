import type { MakeRouteMatchUnion } from "@tanstack/react-router"

import type { PermissionCode } from "@/lib/types/permission.type"
import type { FileRouteTypes } from "@/routeTree.gen"

/**
 * Every `/manage` route, with `$param` placeholders exactly as a route match reports them.
 * A route split into its own layout route + data-owning child (see `architecture.md`'s
 * "Layer boundaries") produces an extra index-route fullPath ending in "/" — the same page,
 * same permission as its layout's own entry below, so it's excluded here rather than needing
 * a near-duplicate key per split route.
 */
export type ManageRoutePath = Exclude<
  Extract<FileRouteTypes["fullPaths"], `/manage${string}`>,
  `${string}/`
>

/** The `fullPath` of any matched route — spans the whole tree, including the root's `""`. */
type MatchedRoutePath = MakeRouteMatchUnion["fullPath"]

/**
 * The single source of truth for who may open which page. `Record` (not `Partial`) makes
 * this exhaustive by construction: adding a `/manage/*` route fails `pnpm typecheck` until
 * its access is declared here. `null` means any signed-in user.
 *
 * Read once, in the `(authed)` layout's `beforeLoad`, against the full destination match
 * array (verified against `@tanstack/router-core@1.171.18`: a parent route's `beforeLoad`
 * receives every child match about to render, not just its own) — see `guard.ts`'s
 * `requireRoutePermissions`. No page under `(authed)` needs its own guard.
 *
 * `/manage` MUST stay `null` — it is the redirect target for a denied route, so gating it
 * would bounce an unauthorized user in a loop.
 */
const routePermissions: Record<ManageRoutePath, PermissionCode | null> = {
  "/manage": null,

  "/manage/clients": "clients:read",
  "/manage/clients/create": "clients:create",
  "/manage/clients/$clientId/update": "clients:update",

  "/manage/inventory-issues": "inventory:read",

  "/manage/inventory-materials": "inventory:read",
  "/manage/inventory-products": "inventory:read",
  // Guarded on `inventory:read`, not a write permission: a read-only viewer should reach this
  // screen. It has no write actions of its own — editing stays on the Products feature.
  "/manage/inventory-products/$itemId": "inventory:read",

  "/manage/inventory-receipts": "inventory:read",
  "/manage/inventory-receipts/create": "inventory:create",
  "/manage/inventory-receipts/create-receipt": "inventory:create",
  "/manage/inventory-receipts/$inventoryReceiptId": "inventory:read",
  "/manage/inventory-receipts/$inventoryReceiptId/update": "inventory:update",

  "/manage/inventory-requisitions": "inventory-requisitions:read",
  "/manage/inventory-requisitions/create": "inventory-requisitions:create",
  "/manage/inventory-requisitions/$requisitionId":
    "inventory-requisitions:read",

  "/manage/iqc": "iqc:read",
  "/manage/iqc/$iqcId": "iqc:read",

  "/manage/materials": "items:read",
  "/manage/materials/create": "items:create",
  "/manage/materials/$materialId/update": "items:update",

  "/manage/operations": "operations:read",

  "/manage/oqc": "oqc:read",
  "/manage/oqc/$oqcId": "oqc:read",

  "/manage/orders": "orders:read",
  "/manage/orders/create": "orders:create",
  // Guarded on `orders:read`, not `orders:update`: a read-only viewer should reach this
  // screen. The write action gates itself (`RoutePermissionGate route="/manage/orders/$orderId/update"`).
  "/manage/orders/$orderId": "orders:read",
  "/manage/orders/$orderId/update": "orders:update",

  "/manage/outbound-orders": "outbound:read",
  "/manage/outbound-orders/create": "outbound:create",
  // No separate `/update` route (BUG-090) — sửa là edit-inline trên chính trang chi tiết
  // (`?mode=edit`), gate bằng PermissionGate quanh nút "Sửa" chứ không phải route riêng.
  "/manage/outbound-orders/$outboundOrderId": "outbound:read",

  // The list route had no guard at all before this map — the only one missed. Its create/
  // detail siblings already require `outsourcing:*`; this closes that gap.
  "/manage/outsourcing-orders": "outsourcing:read",
  "/manage/outsourcing-orders/create": "outsourcing:create",
  "/manage/outsourcing-orders/$outsourcingOrderId": "outsourcing:read",

  "/manage/outsourcing-receipts": "outsourcing:read",
  "/manage/outsourcing-receipts/create": "outsourcing:create",
  "/manage/outsourcing-receipts/$outsourcingReceiptId": "outsourcing:read",

  "/manage/payment-requests": "purchasing:read",
  "/manage/payment-requests/$paymentRequestId": "purchasing:read",

  "/manage/production-execution": "production:read",
  "/manage/production-execution/$productionJobId": "production:read",

  "/manage/production-jobs": "production:read",
  "/manage/production-jobs/$productionJobId": "production:read",

  "/manage/production-orders": "production:read",
  "/manage/production-orders/$productionOrderId": "production:read",

  "/manage/products": "items:read",
  "/manage/products/create": "items:create",
  // Guarded on `items:read`, not `items:update`: a read-only viewer should reach this
  // screen. The write actions gate themselves with PermissionGate.
  "/manage/products/$productId": "items:read",

  "/manage/purchase-ledger": "purchasing:read",

  "/manage/purchase-orders": "purchasing:read",
  "/manage/purchase-orders/create": "purchasing:create",
  "/manage/purchase-orders/$purchaseOrderId": "purchasing:read",

  "/manage/purchase-quotations": "purchasing:read",
  "/manage/purchase-quotations/create": "purchasing:create",
  "/manage/purchase-quotations/$purchaseQuotationId": "purchasing:read",

  "/manage/purchase-requests": "purchase-requests:read",
  "/manage/purchase-requests/create": "purchase-requests:create",
  "/manage/purchase-requests/$purchaseRequestId": "purchase-requests:read",

  "/manage/roles": "roles:read",
  "/manage/roles/create": "roles:create",
  "/manage/roles/$roleId/update": "roles:update",

  "/manage/supplier-returns": "inventory:read",
  "/manage/supplier-returns/$supplierReturnId": "inventory:read",

  "/manage/suppliers": "suppliers:read",
  "/manage/suppliers/create": "suppliers:create",
  "/manage/suppliers/$supplierId": "suppliers:read",
  "/manage/suppliers/$supplierId/update": "suppliers:update",

  // Units has no `units:*` permission of its own — it reuses `items:*`, matching the
  // backend's route guards (`items:create`/`items:update`; there is no `items:delete`, so
  // delete is also gated on `items:update`). Create/update aren't routes — they're dialogs
  // opened from this list page — so they gate themselves with `PermissionGate` instead of
  // an entry here (see UnitsPage.tsx/UnitsTableColumns.tsx).
  "/manage/units": "items:read",

  // No `users:read` exists in the backend catalogue — reading the staff list is gated on
  // `users:update`, matching the backend's own guard.
  "/manage/users": "users:update",
  "/manage/users/create": "users:create",
  "/manage/users/$userId/update": "users:update",
}

/**
 * Widened view of `routePermissions`. `match.fullPath` spans every route in the tree
 * (including the root's `""`), so it can't index the exhaustive map above directly. A
 * mapped type carries an implicit index signature, so this assignment needs no cast.
 */
const routePermissionsByPath: Readonly<
  Record<string, PermissionCode | null | undefined>
> = routePermissions

/**
 * The permission a matched route requires, or `null` when any signed-in user may open it.
 * Takes a route `fullPath` (with `$param` placeholders) — not a resolved `location.pathname`,
 * which would never match a param segment and silently allow.
 */
export function requiredPermissionForPath(
  path: MatchedRoutePath
): PermissionCode | null {
  return routePermissionsByPath[path] ?? null
}

/**
 * Route chỉ tồn tại khi chạy `pnpm dev`. Build production có `import.meta.env.DEV = false`
 * ngay lúc compile, nên router guard đá về `/manage` còn sidebar bỏ luôn mục menu — cùng
 * hai chốt chặn mà phân quyền đang dùng. Màn Phân quyền sửa thẳng catalogue quyền của hệ
 * thống, chưa mở cho người dùng thật trong giai đoạn nghiệm thu.
 *
 * Khai `ReadonlySet<string>` (không phải `Set<ManageRoutePath>`) vì `match.fullPath` trải
 * rộng hơn `ManageRoutePath` — cùng lý do với `routePermissionsByPath` ở trên.
 */
const devOnlyRoutes: ReadonlySet<string> = new Set<ManageRoutePath>([
  "/manage/roles",
  "/manage/roles/create",
  "/manage/roles/$roleId/update",
])

/**
 * Route này có tồn tại trong bản build hiện tại không. Chỉ `false` với `devOnlyRoutes` ở
 * build production. Đọc kèm `requiredPermissionForPath` ở cả guard lẫn sidebar, nên một
 * route đã ẩn thì không nơi nào mở hay link tới được.
 */
export function isRouteAvailable(path: MatchedRoutePath): boolean {
  return import.meta.env.DEV || !devOnlyRoutes.has(path)
}
