import type { FileResource } from "@/lib/types/file.type"
import type { ClientRef } from "@/lib/types/client.type"
import type { ItemRef } from "@/lib/types/item.type"
import type { ProductionOrderStatus } from "@/lib/types/production-order.type"
import type { UserRef } from "@/lib/types/user.type"

// `INTERNAL` = NCR-NB (lỗi nội bộ, sinh tự động từ OQC sàng lọc hoặc tạo tay); `CUSTOMER` =
// NCR-KH (khách hàng phản hồi, chỉ tạo tay).
export const NcrType = {
  INTERNAL: "INTERNAL",
  CUSTOMER: "CUSTOMER",
} as const

export type NcrType = (typeof NcrType)[keyof typeof NcrType]

export const ncrTypeLabels: Record<NcrType, string> = {
  [NcrType.INTERNAL]: "NCR-NB (nội bộ)",
  [NcrType.CUSTOMER]: "NCR-KH (khách hàng)",
}

export const NcrOriginType = {
  OQC: "OQC",
  MANUAL: "MANUAL",
} as const

export type NcrOriginType = (typeof NcrOriginType)[keyof typeof NcrOriginType]

export const ncrOriginTypeLabels: Record<NcrOriginType, string> = {
  [NcrOriginType.OQC]: "Từ OQC sàng lọc",
  [NcrOriginType.MANUAL]: "Tạo tay",
}

export const NcrStatus = {
  OPEN: "OPEN",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  IN_PROGRESS: "IN_PROGRESS",
  PENDING_QC: "PENDING_QC",
  CLOSED: "CLOSED",
  REJECTED: "REJECTED",
} as const

export type NcrStatus = (typeof NcrStatus)[keyof typeof NcrStatus]

export const ncrStatusLabels: Record<NcrStatus, string> = {
  [NcrStatus.OPEN]: "Chờ phân tích",
  [NcrStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [NcrStatus.APPROVED]: "Đã duyệt",
  [NcrStatus.IN_PROGRESS]: "Đang xử lý",
  [NcrStatus.PENDING_QC]: "Chờ OQC lại",
  [NcrStatus.CLOSED]: "Đã đóng",
  [NcrStatus.REJECTED]: "Không duyệt",
}

// Hướng xử lý của LSX phụ sinh từ NCR.
export const NcrProductionAction = {
  REWORK: "REWORK",
  REMAKE: "REMAKE",
} as const

export type NcrProductionAction =
  (typeof NcrProductionAction)[keyof typeof NcrProductionAction]

export const ncrProductionActionLabels: Record<NcrProductionAction, string> = {
  [NcrProductionAction.REWORK]: "Sửa chữa",
  [NcrProductionAction.REMAKE]: "Làm mới",
}

export const NcrCostKind = {
  MATERIAL: "MATERIAL",
  LABOR: "LABOR",
  OUTSOURCING: "OUTSOURCING",
  OTHER: "OTHER",
} as const

export type NcrCostKind = (typeof NcrCostKind)[keyof typeof NcrCostKind]

export const ncrCostKindLabels: Record<NcrCostKind, string> = {
  [NcrCostKind.MATERIAL]: "Vật tư",
  [NcrCostKind.LABOR]: "Nhân công",
  [NcrCostKind.OUTSOURCING]: "Gia công ngoài",
  [NcrCostKind.OTHER]: "Khác",
}

export type NcrDepartmentRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's NcrResDto (GET /api/ncrs). `order` is the SO the NCR hangs on — the
 *  original order for an NCR-NB from OQC, picked by the user for a manual NCR-KH; only an NCR
 *  with an `order` can create a LSX phụ. `rework + remake ≤ ng`; the rest is "chỉ ghi nhận". */
export type Ncr = {
  id: string
  code: string
  type: NcrType
  originType: NcrOriginType
  status: NcrStatus
  item: ItemRef
  client: ClientRef | null
  order: { id: string; code: string } | null
  productionJob: { id: string; code: string } | null
  department: NcrDepartmentRef | null
  ngQty: number
  reworkQty: number
  remakeQty: number
  defectDescription: string | null
  rootCause: string | null
  correctiveAction: string | null
  preventiveAction: string | null
  rejectionReason: string | null
  approvedAt: string | null
  approverBy: UserRef | null
  createdAt: string
}

export type NcrCostLine = {
  id: string
  kind: NcrCostKind
  description: string
  itemId: string | null
  quantity: number
  unitPrice: number
  amount: number
  isSuggested: boolean
}

export type NcrProductionOrder = {
  id: string
  code: string
  ncrAction: NcrProductionAction
  status: ProductionOrderStatus
}

export const NcrLogAction = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PRODUCTION_ORDER_CREATED: "PRODUCTION_ORDER_CREATED",
  OQC_REQUESTED: "OQC_REQUESTED",
  PENDING_QC: "PENDING_QC",
  CLOSED: "CLOSED",
} as const

export type NcrLogAction = (typeof NcrLogAction)[keyof typeof NcrLogAction]

export type NcrLog = {
  id: string
  action: NcrLogAction
  /** Ready-to-display Vietnamese sentence written server-side. */
  content: string
  performerBy: UserRef | null
  createdAt: string
}

/** Mirrors the backend's NcrDetailResDto (GET /api/ncrs/:ncrId). */
export type NcrDetail = Ncr & {
  /** Detail only: the product carries its image (the list's `item` does not). */
  item: ItemRef & { image: FileResource | null }
  reworkOperationIds: string[]
  costLines: NcrCostLine[]
  totalCost: number
  productionOrders: NcrProductionOrder[]
  logs: NcrLog[]
}

/** Mirrors the backend's NcrOperationResDto (GET /api/ncrs/:ncrId/operations) — the routing
 *  operations a REWORK LSX can be restricted to. */
export type NcrOperation = {
  operationId: string
  code: string
  name: string
}
