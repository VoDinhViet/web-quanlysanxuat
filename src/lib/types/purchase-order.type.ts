import type { SupplierRef } from "@/lib/types/supplier.type"

/** Mirrors the backend's `purchase_orders.status` column exactly — only 3 values are ever
 *  stored (`be-quanlysanxuat/src/database/schemas/purchasing/purchase-orders.ts`). "Đang nhận
 *  hàng"/"Hoàn tất" are NOT stored here — they're derived at read time from `receivedQuantity`,
 *  see `PurchaseOrderProgress` below. Not used for display; only as the wire shape a future
 *  server function would return. */
export const PurchaseOrderStatus = {
  DRAFT: "DRAFT",
  ORDERED: "ORDERED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]

/** What the UI actually shows/filters by — `docs/domains/purchasing.md` (backend repo) flags
 *  "thinking `purchase_orders.status` has `RECEIVING`/`COMPLETED`" as pitfall #1 of this domain,
 *  so this is deliberately a separate type from `PurchaseOrderStatus`, not a superset reusing its
 *  values. Derived by `resolvePurchaseOrderProgress` from `status` + `receivedQuantity` vs
 *  `orderedQuantity` — never sent/stored as-is. */
export const PurchaseOrderProgress = {
  DRAFT: "DRAFT",
  ORDERED: "ORDERED",
  RECEIVING: "RECEIVING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseOrderProgress =
  (typeof PurchaseOrderProgress)[keyof typeof PurchaseOrderProgress]

export const purchaseOrderProgressLabels: Record<
  PurchaseOrderProgress,
  string
> = {
  [PurchaseOrderProgress.DRAFT]: "Draft",
  [PurchaseOrderProgress.ORDERED]: "Đã đặt hàng",
  [PurchaseOrderProgress.RECEIVING]: "Đang nhận hàng",
  [PurchaseOrderProgress.COMPLETED]: "Hoàn tất",
  [PurchaseOrderProgress.CANCELLED]: "Đã hủy",
}

export const purchaseOrderProgressDescriptions: Record<
  PurchaseOrderProgress,
  string
> = {
  [PurchaseOrderProgress.DRAFT]: "Đang soạn, chưa đặt với NCC",
  [PurchaseOrderProgress.ORDERED]: "Đã đặt với NCC, chưa nhận hàng",
  [PurchaseOrderProgress.RECEIVING]: "Đã nhận một phần",
  [PurchaseOrderProgress.COMPLETED]: "Đã nhận đủ số lượng đặt",
  [PurchaseOrderProgress.CANCELLED]: "Đơn đã bị hủy",
}

/** A quotation/purchase-request a PO's lines trace back to — declared locally rather than
 *  imported from `purchase-request.type.ts`, same idiom as `PurchaseLedgerPurchaseRequestRef`.
 *  A PO has no header-to-header FK to either: it only links at the line level
 *  (`purchase_order_items.purchaseRequestItemId`/`quotationItemId`), and one PO can gather lines
 *  from several different PRs/quotations as long as they share a supplier — hence the array on
 *  `PurchaseOrderApiRow` below, not a single ref. */
export type PurchaseOrderSourceRef = {
  id: string
  code: string
}

/** Mirrors the backend's nested creator relation (`purchase_orders.created_by`), same shape as
 *  `ItemCreator`. */
export type PurchaseOrderCreatorRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `purchase_orders` table (still schema-only — no `purchase-orders` API
 *  module exists yet, see `resolve-purchase-order-progress.ts`). `totalAmount` is the sum of
 *  `quantity * unitPrice` across a PO's lines; `receivedQuantity` sums `POSTED` receipt lines
 *  joined via `purchase_order_item_id`, the same source `PurchaseOrderProgress` reads. */
export type PurchaseOrderApiRow = {
  id: string
  code: string
  supplier: SupplierRef
  status: PurchaseOrderStatus
  orderDate: string
  expectedDate: string | null
  totalAmount: number
  orderedQuantity: number
  receivedQuantity: number
  purchaseRequests: PurchaseOrderSourceRef[]
  quotations: PurchaseOrderSourceRef[]
  creator: PurchaseOrderCreatorRef | null
}

/** `progress` isn't on the wire — derived client-side right after fetch (same idiom as
 *  `PurchaseLedgerRow.warnings`), via `resolvePurchaseOrderProgress`. */
export type PurchaseOrderRow = PurchaseOrderApiRow & {
  progress: PurchaseOrderProgress
}
