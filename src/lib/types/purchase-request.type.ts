import type { Department } from "@/lib/types/department.type"

/** Mirrors the backend's `purchase_requests.status` column (`GET /purchase-requests`). Giai đoạn 1
 *  chỉ có route list — chưa route nào ghi trạng thái, cả 4 giá trị tồn tại sẵn cho vòng đời tương
 *  lai (xem `docs/domains/purchase-requests.md` ở repo backend). */
export enum PurchaseRequestStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const purchaseRequestStatusLabels: Record<
  PurchaseRequestStatus,
  string
> = {
  [PurchaseRequestStatus.DRAFT]: "Nháp",
  [PurchaseRequestStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [PurchaseRequestStatus.APPROVED]: "Đã duyệt",
  [PurchaseRequestStatus.REJECTED]: "Từ chối",
}

/** Mirrors the backend's UserRefResDto nested in PurchaseRequestResDto. */
export type PurchaseRequestRequester = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's ProductionOrderRefResDto — `code` is only set once the LSX is APPROVED,
 *  hence nullable. */
export type PurchaseRequestProductionOrderRef = {
  id: string
  code: string | null
}

/** Mirrors the backend's PurchaseRequestResDto — one row of `GET /purchase-requests`, the "Đề
 *  xuất mua hàng" list screen. */
export type PurchaseRequest = {
  id: string
  code: string
  neededDate: string
  status: PurchaseRequestStatus
  createdAt: string
  department: Department
  requester: PurchaseRequestRequester | null
  productionOrder: PurchaseRequestProductionOrderRef | null
}
