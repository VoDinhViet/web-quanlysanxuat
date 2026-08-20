import type { ItemRef } from "@/lib/types/item.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

// Shares the backend's `InventoryDocumentStatus` enum at the DB/DTO level with
// inventory-receipts, but the issues controller has no `confirm` step — an issue only ever
// goes DRAFT → POSTED (via `post`) or → CANCELLED (via `cancel`, from either state). The
// PENDING_RECEIPT/PENDING_IQC transitional states are receipt-only and never appear here,
// so only the 3 reachable values are modeled — keeps the status badge/label `Record`
// exhaustive and meaningful instead of carrying two dead cases.
export const InventoryIssueStatus = {
  DRAFT: "DRAFT",
  POSTED: "POSTED",
  CANCELLED: "CANCELLED",
} as const

export type InventoryIssueStatus =
  (typeof InventoryIssueStatus)[keyof typeof InventoryIssueStatus]

export const inventoryIssueStatusLabels: Record<InventoryIssueStatus, string> =
  {
    [InventoryIssueStatus.DRAFT]: "Nháp",
    [InventoryIssueStatus.POSTED]: "Đã xuất kho",
    [InventoryIssueStatus.CANCELLED]: "Đã huỷ",
  }

export const inventoryIssueStatusDescriptions: Record<
  InventoryIssueStatus,
  string
> = {
  [InventoryIssueStatus.DRAFT]: "Phiếu đang soạn, chưa đụng tồn kho.",
  [InventoryIssueStatus.POSTED]:
    "Đã ghi sổ, tồn kho đã cập nhật — phiếu bất biến từ đây.",
  [InventoryIssueStatus.CANCELLED]: "Phiếu đã bị huỷ.",
}

export const InventoryIssueType = {
  PRODUCTION: "PRODUCTION",
  SALES: "SALES",
  RETURN: "RETURN",
  ADJUSTMENT: "ADJUSTMENT",
} as const

export type InventoryIssueType =
  (typeof InventoryIssueType)[keyof typeof InventoryIssueType]

export const inventoryIssueTypeLabels: Record<InventoryIssueType, string> = {
  [InventoryIssueType.PRODUCTION]: "Sản xuất",
  [InventoryIssueType.SALES]: "Bán hàng",
  [InventoryIssueType.RETURN]: "Trả hàng",
  [InventoryIssueType.ADJUSTMENT]: "Điều chỉnh",
}

/** Mirrors the backend's `UserRefResDto` as nested on an issue row — declared locally
 *  rather than imported from `inventory-receipt.type.ts`, same idiom as
 *  `InventoryReceiptUserRef`: each domain owns its own ref shape even where it
 *  coincides with another domain's. */
export type InventoryIssueUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `ProductionOrderRefResDto` as nested on an issue row. `code` is
 *  nullable even when the object itself is present — null until the LSX is `APPROVED`,
 *  same as `InventoryReceiptProductionOrderRef`. */
export type InventoryIssueProductionOrderRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's `ProductionJobRefResDto` as nested on an issue row. */
export type InventoryIssueProductionJobRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's `DepartmentResDto` as nested on an issue row. */
export type InventoryIssueDepartmentRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's `InventoryIssueItemResDto` — the line shape on both the list
 *  (`GET /inventory-issues`) and detail (`GET /inventory-issues/:id`) rows; unlike
 *  receipts, issues don't split list/detail line shapes since there's no PO-derived
 *  extra data on an issue line. */
export type InventoryIssueItem = {
  id: string
  item: ItemRef
  quantity: number
  orderItemId: string | null
  note: string | null
}

/** Mirrors the backend's `PageInventoryIssueResDto` (`GET /inventory-issues`) — the list
 *  row shape. No `InventoryIssueDetail` type yet — the detail route doesn't exist in the
 *  frontend this pass. */
export type InventoryIssue = {
  id: string
  code: string
  warehouse: WarehouseRef
  issueType: InventoryIssueType
  status: InventoryIssueStatus
  issueDate: string
  productionOrder: InventoryIssueProductionOrderRef | null
  productionJob: InventoryIssueProductionJobRef | null
  department: InventoryIssueDepartmentRef | null
  requesterBy: InventoryIssueUserRef | null
  note: string | null
  items: InventoryIssueItem[]
  posterBy: InventoryIssueUserRef | null
  postedAt: string | null
  creatorBy: InventoryIssueUserRef | null
  createdAt: string
  updatedAt: string
}
