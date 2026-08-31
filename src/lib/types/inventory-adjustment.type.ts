import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"

export const InventoryAdjustmentType = {
  INCREASE: "INCREASE",
  DECREASE: "DECREASE",
} as const

export type InventoryAdjustmentType =
  (typeof InventoryAdjustmentType)[keyof typeof InventoryAdjustmentType]

export const inventoryAdjustmentTypeLabels: Record<
  InventoryAdjustmentType,
  string
> = {
  [InventoryAdjustmentType.INCREASE]: "Tăng",
  [InventoryAdjustmentType.DECREASE]: "Giảm",
}

export const InventoryAdjustmentReason = {
  STOCKTAKE: "STOCKTAKE",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
  OTHER: "OTHER",
} as const

export type InventoryAdjustmentReason =
  (typeof InventoryAdjustmentReason)[keyof typeof InventoryAdjustmentReason]

export const inventoryAdjustmentReasonLabels: Record<
  InventoryAdjustmentReason,
  string
> = {
  [InventoryAdjustmentReason.STOCKTAKE]: "Kiểm kê",
  [InventoryAdjustmentReason.DAMAGED]: "Hư hỏng",
  [InventoryAdjustmentReason.LOST]: "Thất lạc",
  [InventoryAdjustmentReason.OTHER]: "Khác",
}

// Mirrors the backend's `inventory_document_status` pg enum, nhưng phiếu điều chỉnh không có
// bước `confirm` (cùng lifecycle với inventory-issues) nên chỉ 3/5 giá trị có thể xuất hiện —
// PENDING_RECEIPT/PENDING_IQC là receipt-only, không bao giờ có ở đây.
export const InventoryAdjustmentStatus = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  CANCELLED: "CANCELLED",
} as const

export type InventoryAdjustmentStatus =
  (typeof InventoryAdjustmentStatus)[keyof typeof InventoryAdjustmentStatus]

export const inventoryAdjustmentStatusLabels: Record<
  InventoryAdjustmentStatus,
  string
> = {
  [InventoryAdjustmentStatus.DRAFT]: "Nháp",
  [InventoryAdjustmentStatus.POSTED]: "Đã ghi sổ",
  [InventoryAdjustmentStatus.CANCELLED]: "Đã huỷ",
}

export const inventoryAdjustmentStatusDescriptions: Record<
  InventoryAdjustmentStatus,
  string
> = {
  [InventoryAdjustmentStatus.DRAFT]: "Phiếu đang soạn, chưa đụng tồn kho.",
  [InventoryAdjustmentStatus.POSTED]:
    "Đã ghi sổ, tồn kho đã cập nhật — phiếu bất biến từ đây.",
  [InventoryAdjustmentStatus.CANCELLED]: "Phiếu đã bị huỷ.",
}

// Backend rejects a PATCH/DELETE/post/cancel-from-cancelled off DRAFT
// (`inventory_document.error.invalid_status_transition`) — used by the update route's loader to
// bounce away instead of showing a form that can never save, same idiom as `canUpdateInventoryReceipt`.
export function canUpdateInventoryAdjustment(
  status: InventoryAdjustmentStatus
): boolean {
  return status === InventoryAdjustmentStatus.DRAFT
}

/** Mirrors the backend's `UserRefResDto` as nested on an adjustment row — declared locally rather
 *  than imported from another domain's type file, same idiom as `InventoryReceiptUserRef`/
 *  `InventoryIssueUserRef`: each domain owns its own ref shape even where it coincides. */
export type InventoryAdjustmentUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `InventoryAdjustmentItemResDto` — the line shape on both the list
 *  (`GET /inventory-adjustments`) and detail (`GET /inventory-adjustments/:id`) rows; unlike
 *  receipts, adjustments don't split list/detail line shapes since there's no PO-derived extra
 *  data on a line. */
export type InventoryAdjustmentItem = {
  id: string
  item: ItemRef
  unit: Unit
  quantity: number
  note: string | null
}

/** Mirrors the backend's `PageInventoryAdjustmentResDto` (`GET /inventory-adjustments`) — the
 *  list row shape. Independent from `InventoryAdjustmentDetail` below, not a subset/superset via
 *  `extends` (same two-layer convention as `inventory-receipt.type.ts`). */
export type InventoryAdjustment = {
  id: string
  code: string
  adjustmentType: InventoryAdjustmentType
  reason: InventoryAdjustmentReason
  status: InventoryAdjustmentStatus
  adjustmentDate: string
  note: string | null
  items: InventoryAdjustmentItem[]
  creatorBy: InventoryAdjustmentUserRef | null
  createdAt: string
}

/** Mirrors the backend's `InventoryAdjustmentResDto` (`GET /inventory-adjustments/:id`) — the
 *  detail shape, adds `posterBy`/`postedAt`/`updatedAt` over `InventoryAdjustment`. */
export type InventoryAdjustmentDetail = InventoryAdjustment & {
  posterBy: InventoryAdjustmentUserRef | null
  postedAt: string | null
  updatedAt: string
}
