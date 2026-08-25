import type { ClientRef } from "@/lib/types/client.type"
import type { ItemRef } from "@/lib/types/item.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

// PENDING_RECEIPT/PENDING_IQC sit between DRAFT and POSTED — reached via `confirm`
// (InventoryReceiptsController's `POST :id/confirm`), which the create-from-PO wizard calls
// right after create (see inventory-receipts/components/create-from-po/). `requiresIqc` on the
// receipt decides which of the two `confirm` lands on; `post` accepts either (PENDING_IQC only
// once every IQC inspection tied to it is COMPLETED).
export const InventoryReceiptStatus = {
  DRAFT: "DRAFT",
  PENDING_RECEIPT: "PENDING_RECEIPT",
  PENDING_IQC: "PENDING_IQC",
  POSTED: "POSTED",
  CANCELLED: "CANCELLED",
} as const

export type InventoryReceiptStatus =
  (typeof InventoryReceiptStatus)[keyof typeof InventoryReceiptStatus]

export const inventoryReceiptStatusLabels: Record<
  InventoryReceiptStatus,
  string
> = {
  [InventoryReceiptStatus.DRAFT]: "Nháp",
  [InventoryReceiptStatus.PENDING_RECEIPT]: "Chờ nhập kho",
  [InventoryReceiptStatus.PENDING_IQC]: "Chờ IQC",
  [InventoryReceiptStatus.POSTED]: "Đã nhập kho",
  [InventoryReceiptStatus.CANCELLED]: "Đã huỷ",
}

export const inventoryReceiptStatusDescriptions: Record<
  InventoryReceiptStatus,
  string
> = {
  [InventoryReceiptStatus.DRAFT]: "Phiếu đang soạn, chưa đụng tồn kho.",
  [InventoryReceiptStatus.PENDING_RECEIPT]:
    "Phiếu đã xác nhận, sẵn sàng để nhập kho.",
  [InventoryReceiptStatus.PENDING_IQC]:
    "Phiếu đã xác nhận và đang chờ kiểm tra chất lượng (IQC).",
  [InventoryReceiptStatus.POSTED]:
    "Đã ghi sổ, tồn kho đã cập nhật — phiếu bất biến từ đây.",
  [InventoryReceiptStatus.CANCELLED]: "Phiếu đã bị huỷ.",
}

// Backend rejects a PATCH/DELETE off DRAFT (`inventory_document.error.invalid_status_transition`)
// — used by the update route's loader to bounce away instead of showing a form that can never
// save, same idiom as `canUpdateOrder` in `order.type.ts`.
export function canUpdateInventoryReceipt(
  status: InventoryReceiptStatus
): boolean {
  return status === InventoryReceiptStatus.DRAFT
}

export const InventoryReceiptType = {
  PURCHASE: "PURCHASE",
  PRODUCTION: "PRODUCTION",
  RETURN: "RETURN",
  ADJUSTMENT: "ADJUSTMENT",
} as const

export type InventoryReceiptType =
  (typeof InventoryReceiptType)[keyof typeof InventoryReceiptType]

export const inventoryReceiptTypeLabels: Record<InventoryReceiptType, string> =
  {
    [InventoryReceiptType.PURCHASE]: "Mua hàng",
    [InventoryReceiptType.PRODUCTION]: "Từ sản xuất",
    [InventoryReceiptType.RETURN]: "Trả hàng",
    [InventoryReceiptType.ADJUSTMENT]: "Điều chỉnh",
  }

/** Mirrors the backend's `UserRefResDto` as nested on a receipt row — declared locally rather
 *  than imported from `user.type.ts`, same idiom as `PurchaseRequestUserRef`/`PurchaseOrderUserRef`:
 *  each domain owns its own ref shape even where it coincides with another domain's. */
export type InventoryReceiptUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `PurchaseRequestRefResDto` as nested on a receipt row. */
export type InventoryReceiptPurchaseRequestRef = {
  id: string
  code: string
}

/** Mirrors the backend's `ProductionOrderRefResDto` as nested on a receipt row. `code` is
 *  nullable even when the object itself is present — null until the LSX is `APPROVED`. */
export type InventoryReceiptProductionOrderRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's `ProductionJobRefResDto` as nested on a receipt row — unlike
 *  `InventoryReceiptProductionOrderRef`, `code` is never null: a Job only exists once its LSX is
 *  `APPROVED` (`docs/domains/production.md`), by which point it already has a code. */
export type InventoryReceiptProductionJobRef = {
  id: string
  code: string
}

/** Mirrors the backend's `PurchaseOrderRefResDto` as nested on a receipt row. */
export type InventoryReceiptPurchaseOrderRef = {
  id: string
  code: string
}

/** Mirrors the backend's `PurchaseOrderItemRefResDto` as nested on a receipt line — only present
 *  when the line was picked from a PO (`purchaseOrderItemId` set). */
export type InventoryReceiptPurchaseOrderItemRef = {
  id: string
  quantity: number
}

/** Mirrors the backend's `PageInventoryReceiptItemResDto` — the line shape on the **list** row
 *  (`GET /inventory-receipts`). No PO ref, no stock numbers — those only exist on the detail
 *  line shape below (`.claude/rules/api.md` two-layer Page/Detail convention). */
export type InventoryReceiptItem = {
  id: string
  item: ItemRef
  quantity: number
  unitPrice: number | null
  note: string | null
}

/** Mirrors the backend's `InventoryReceiptItemResDto` — the line shape on the **detail** route
 *  (`GET /inventory-receipts/:id`). `onHand`/`bomDemand`/`available`/`fromStock` are computed at
 *  read time (`item-stock.query.ts` on the backend), not stored columns. */
export type InventoryReceiptItemDetail = InventoryReceiptItem & {
  purchaseOrderItem: InventoryReceiptPurchaseOrderItemRef | null
  onHand: number
  bomDemand: number
  available: number
  fromStock: number
}

/** Mirrors the backend's `PageInventoryReceiptResDto` (`GET /inventory-receipts`) — the list row
 *  shape. Independent from `InventoryReceiptDetail` below, not a subset/superset via `extends`
 *  (same two-layer convention as `purchase-ledger`/`purchase-request` types). */
export type InventoryReceipt = {
  id: string
  code: string
  warehouse: WarehouseRef
  receiptType: InventoryReceiptType
  status: InventoryReceiptStatus
  receiptDate: string
  supplier: SupplierRef | null
  client: ClientRef | null
  purchaseRequest: InventoryReceiptPurchaseRequestRef | null
  productionOrder: InventoryReceiptProductionOrderRef | null
  productionJob: InventoryReceiptProductionJobRef | null
  purchaseOrder: InventoryReceiptPurchaseOrderRef | null
  note: string | null
  items: InventoryReceiptItem[]
  posterBy: InventoryReceiptUserRef | null
  postedAt: string | null
  creatorBy: InventoryReceiptUserRef | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's `InventoryReceiptResDto` (`GET /inventory-receipts/:id`) — the detail
 *  shape, same header fields as `InventoryReceipt` but full line items (`InventoryReceiptItemDetail`). */
export type InventoryReceiptDetail = Omit<InventoryReceipt, "items"> & {
  items: InventoryReceiptItemDetail[]
}
