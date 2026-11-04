import type { PaginatedResponse } from "@/lib/types/pagination.type"

/** Loại phiếu lãnh vật tư — mirrors the backend's InventoryRequisitionType. */
export type HeldRequisitionType = "PRODUCTION" | "OTHER"

export const heldRequisitionTypeLabels: Record<HeldRequisitionType, string> = {
  PRODUCTION: "Sản xuất",
  OTHER: "Khác",
}

/** Mirrors the backend's HeldRequisitionResDto. `poOrReason`: số PO của đơn hàng (phiếu PRODUCTION)
 *  hoặc lý do lãnh (phiếu OTHER). */
export type HeldRequisition = {
  requisitionId: string
  code: string
  approvedAt: string | null
  jobCode: string | null
  poOrReason: string | null
  departmentName: string | null
  creatorName: string | null
  quantity: number
  note: string | null
}

/** `totalQuantity` cộng mọi trang của kết quả lọc, không chỉ trang này. */
export type HeldRequisitionsResult = PaginatedResponse<HeldRequisition> & {
  totalQuantity: number
}

/** Hộp thoại chi tiết số lượng giữ cố định 5 dòng mỗi trang, không có ô chọn cỡ trang. */
export const HELD_REQUISITIONS_PAGE_SIZE = 5

/** Bộ lọc và phân trang của bảng phiếu đang giữ; mirrors GetHeldRequisitionsReqDto. */
export type HeldRequisitionsSearch = {
  page: number
  limit: number
  q?: string
  departmentId?: string
  type?: HeldRequisitionType
}
