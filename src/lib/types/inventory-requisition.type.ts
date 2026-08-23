import type { WarehouseRef } from "@/lib/types/warehouse.type"

// Lifecycle (be-quanlysanxuat/docs/workflows/inventory-requisition.md):
// DRAFT --send--> PENDING_APPROVAL --approve--> APPROVED --issue--> ISSUED (điểm cuối)
//                        |
//                        +--reject--> REJECTED --send--> PENDING_APPROVAL
// Mọi trạng thái trừ ISSUED/CANCELLED đều huỷ được (cancel).
export const InventoryRequisitionStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  ISSUED: "ISSUED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const

export type InventoryRequisitionStatus =
  (typeof InventoryRequisitionStatus)[keyof typeof InventoryRequisitionStatus]

export const inventoryRequisitionStatusLabels: Record<
  InventoryRequisitionStatus,
  string
> = {
  [InventoryRequisitionStatus.DRAFT]: "Nháp",
  [InventoryRequisitionStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [InventoryRequisitionStatus.APPROVED]: "Đã duyệt",
  [InventoryRequisitionStatus.ISSUED]: "Đã xuất",
  [InventoryRequisitionStatus.REJECTED]: "Từ chối",
  [InventoryRequisitionStatus.CANCELLED]: "Đã hủy",
}

export const inventoryRequisitionStatusDescriptions: Record<
  InventoryRequisitionStatus,
  string
> = {
  [InventoryRequisitionStatus.DRAFT]: "Phiếu đang soạn, chưa gửi duyệt.",
  [InventoryRequisitionStatus.PENDING_APPROVAL]:
    "Phiếu chờ người có thẩm quyền duyệt.",
  [InventoryRequisitionStatus.APPROVED]: "Phiếu đã được duyệt, chờ kho xuất.",
  [InventoryRequisitionStatus.ISSUED]: "Phiếu đã xuất kho, tồn kho đã trừ.",
  [InventoryRequisitionStatus.REJECTED]:
    "Phiếu bị từ chối, có thể sửa và gửi lại.",
  [InventoryRequisitionStatus.CANCELLED]: "Phiếu đã bị hủy trước khi xuất.",
}

export const InventoryRequisitionType = {
  PRODUCTION: "PRODUCTION",
  OTHER: "OTHER",
} as const

export type InventoryRequisitionType =
  (typeof InventoryRequisitionType)[keyof typeof InventoryRequisitionType]

/** Mirrors the backend's `DepartmentResDto` as nested on a requisition row. */
export type InventoryRequisitionDepartmentRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's `ProductionJobRefResDto` as nested on a requisition row. */
export type InventoryRequisitionJobRef = {
  id: string
  code: string
}

/** Mirrors the backend's `OrderRefResDto` as nested on `productionOrder`. */
export type InventoryRequisitionOrderRef = {
  id: string
  code: string
}

/** Mirrors the backend's `RequisitionProductionOrderResDto` — `code` is the LSX code, null
 *  until the LSX is `APPROVED`; `order.code` is the PO code shown in the "PO / Lý do" column. */
export type InventoryRequisitionProductionOrderRef = {
  id: string
  code: string | null
  order: InventoryRequisitionOrderRef
}

/** Mirrors the backend's `UserRefResDto` as nested on a requisition row. */
export type InventoryRequisitionUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `PageInventoryRequisitionResDto` (`GET /inventory-requisitions`) —
 *  the list row shape. */
export type InventoryRequisition = {
  id: string
  code: string
  requisitionDate: string
  type: InventoryRequisitionType
  status: InventoryRequisitionStatus
  warehouse: WarehouseRef
  department: InventoryRequisitionDepartmentRef | null
  // LSX liên quan — productionOrder.order.code là mã PO hiển thị ở cột "PO / Lý do".
  productionOrder: InventoryRequisitionProductionOrderRef | null
  productionJob: InventoryRequisitionJobRef | null
  // Lý do lãnh — chỉ có ý nghĩa khi type = OTHER.
  reason: string | null
  creatorBy: InventoryRequisitionUserRef | null
  createdAt: string
}

/** Mirrors the backend's `ItemRefResDto` as nested on `InventoryRequisitionItemRef.unit`. */
export type InventoryRequisitionItemUnitRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's `ItemUnitRefResDto` as nested on a requisition line. */
export type InventoryRequisitionItemRef = {
  id: string
  code: string
  name: string
  unit: InventoryRequisitionItemUnitRef
}

/** Mirrors the backend's `InventoryRequisitionItemResDto` — one line of a requisition's detail.
 *  `bomQuantity`/`issuedQuantity` are null when the requisition isn't tied to a Job (`type =
 *  OTHER`). The "6 numbers" (`onHand`/`reservedQuantity`/`issuableQuantity`/`availableQuantity`
 *  plus `bomQuantity`/`issuedQuantity`) are read-time snapshots, not stored — see
 *  `docs/domains/inventory.md`, mục "Phiếu lãnh vật tư" ở backend. */
export type InventoryRequisitionItem = {
  id: string
  item: InventoryRequisitionItemRef
  quantity: number
  bomQuantity: number | null
  issuedQuantity: number | null
  onHand: number
  reservedQuantity: number
  issuableQuantity: number
  availableQuantity: number
  note: string | null
}

/** Mirrors the backend's `InventoryIssueRefResDto` — the phiếu xuất kho auto-generated when a
 *  requisition is issued. No detail route exists for `inventory-issues` yet, so this is only
 *  ever shown as plain text, never linked. */
export type InventoryRequisitionIssueRef = {
  id: string
  code: string
}

/** Mirrors the backend's `InventoryRequisitionResDto` (`GET /inventory-requisitions/:id`) —
 *  adds the full approval audit trail + line items over `InventoryRequisition`. Each
 *  `<verb>erBy`/`<verb>edAt` pair is set once, the first time that step happens — a REJECTED →
 *  resent phiếu keeps its stale `senderBy`/`sentAt` from the first send until sent again, same
 *  idiom as every other approval-flow detail type in this repo. */
export type InventoryRequisitionDetail = InventoryRequisition & {
  note: string | null
  inventoryIssue: InventoryRequisitionIssueRef | null
  senderBy: InventoryRequisitionUserRef | null
  sentAt: string | null
  approverBy: InventoryRequisitionUserRef | null
  approvedAt: string | null
  rejecterBy: InventoryRequisitionUserRef | null
  rejectedAt: string | null
  rejectionReason: string | null
  issuerBy: InventoryRequisitionUserRef | null
  issuedAt: string | null
  items: InventoryRequisitionItem[]
  updatedAt: string
}
