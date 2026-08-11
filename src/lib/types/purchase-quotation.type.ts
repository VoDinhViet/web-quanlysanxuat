import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `PurchaseQuotationStatus` (`be-quanlysanxuat/src/database/schemas/
 *  purchasing/purchase-quotations.ts`) exactly — an approval lifecycle, same shape as
 *  `PurchaseRequestStatus`: `DRAFT → (send) → PENDING_APPROVAL → (approve) → APPROVED`, or
 *  `PENDING_APPROVAL → (reject) → CANCELLED`. An `APPROVED` quotation can also `recall` back to
 *  `DRAFT` as long as none of its generated purchase orders have been placed yet. */
export const PurchaseQuotationStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseQuotationStatus =
  (typeof PurchaseQuotationStatus)[keyof typeof PurchaseQuotationStatus]

export const purchaseQuotationStatusLabels: Record<
  PurchaseQuotationStatus,
  string
> = {
  [PurchaseQuotationStatus.DRAFT]: "Nháp",
  [PurchaseQuotationStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [PurchaseQuotationStatus.APPROVED]: "Đã duyệt",
  [PurchaseQuotationStatus.CANCELLED]: "Đã hủy",
}

export const purchaseQuotationStatusDescriptions: Record<
  PurchaseQuotationStatus,
  string
> = {
  [PurchaseQuotationStatus.DRAFT]: "Đang soạn, chưa gửi duyệt",
  [PurchaseQuotationStatus.PENDING_APPROVAL]:
    "Đã gửi, chờ duyệt chọn NCC thắng thầu",
  [PurchaseQuotationStatus.APPROVED]:
    "Đã duyệt, đã tạo đơn mua nháp cho NCC thắng thầu",
  [PurchaseQuotationStatus.CANCELLED]: "Báo giá đã bị từ chối/hủy",
}

/** Mirrors the backend's `UserRefResDto` nested on `creatorBy`/`approverBy`, same shape as
 *  `PurchaseRequestUserRef`. */
export type PurchaseQuotationUserRef = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's `QuotationItemSupplierLastPurchaseResDto` — giá + ngày lần đặt mua
 *  gần nhất của đúng vật tư này với đúng NCC này (không phải giá gần nhất nói chung). */
export type PurchaseQuotationLastPurchase = {
  unitPrice: number
  orderDate: string
}

/** Mirrors the backend's `QuotationItemSupplierResDto` (`be-quanlysanxuat/src/api/
 *  purchase-quotations/dto/quotation-item-supplier.res.dto.ts`). `selectedAt !== null` nghĩa
 *  là NCC này thắng thầu cho vật tư này — không có cột boolean riêng, suy trực tiếp từ field
 *  này (unique index phía backend đảm bảo tối đa 1 dòng thắng thầu/vật tư). */
export type PurchaseQuotationItemSupplierDetail = {
  id: string
  supplier: SupplierRef
  unitPrice: number | null
  leadTimeDays: number | null
  note: string | null
  lastPurchase: PurchaseQuotationLastPurchase | null
  selectorBy: PurchaseQuotationUserRef | null
  selectedAt: string | null
}

/** Mirrors the backend's `QuotationItemResDto`. */
export type PurchaseQuotationItemDetail = {
  id: string
  quantity: number
  quantityAdjustmentReason: string | null
  purchaseRequestItem: {
    id: string
    quantity: number
    purchaseRequest: { id: string; code: string }
    item: { id: string; code: string; name: string; unit: Unit }
  }
  suppliers: PurchaseQuotationItemSupplierDetail[]
}

/** Lựa chọn NCC đang chờ duyệt trên trang chi tiết: `quotationItemId` → `quotationItemSupplierId`,
 *  một entry mỗi vật tư. Chỉ là state phía UI cho tới khi bấm Duyệt — backend chốt lại bằng
 *  `selectedAt`/`selectorBy` trên từng dòng NCC (`PurchaseQuotationItemSupplierDetail` ở trên). */
export type PurchaseQuotationSupplierSelection = Record<string, string>

/** Mirrors the backend's `QuotationResDto` (`GET /purchase-quotations/:id`) exactly,
 *  field-for-field. `approvedAt`/`approverBy` KHÔNG bị xóa khi một RFQ `APPROVED` được thu hồi
 *  (`recall`) về `DRAFT` — backend cố tình giữ lại làm dấu vết lịch sử — nên đừng suy
 *  "đang duyệt" từ `approvedAt != null`, luôn kiểm tra `status`. */
export type PurchaseQuotationDetail = {
  id: string
  code: string
  status: PurchaseQuotationStatus
  note: string | null
  items: PurchaseQuotationItemDetail[]
  senderBy: PurchaseQuotationUserRef | null
  sentAt: string | null
  approverBy: PurchaseQuotationUserRef | null
  approvedAt: string | null
  cancellerBy: PurchaseQuotationUserRef | null
  cancelledAt: string | null
  cancellationReason: string | null
  creatorBy: PurchaseQuotationUserRef | null
  createdAt: string
  updatedAt: string
}

/** Local copy of `OrderTimelineStepState`/`OrderTimelineStep` (`order.type.ts`) — domain types
 *  don't reach across features, so this feature keeps its own identical shape rather than
 *  importing orders'. */
export type PurchaseQuotationTimelineStepState =
  | "done"
  | "current"
  | "upcoming"
  | "cancelled"

export type PurchaseQuotationTimelineStep = {
  key: string
  label: string
  state: PurchaseQuotationTimelineStepState
  timestamp: string | null
  actor: string | null
  detail: string | null
}

/** Mirrors `PageQuotationResDto` (`be-quanlysanxuat/src/api/purchase-quotations/dto/
 *  page-quotation.res.dto.ts`) exactly, field-for-field — the list response. There is
 *  deliberately no `supplier` here: a quotation's suppliers now live per vật tư
 *  (`purchase_quotation_item_suppliers`), not one per header, so the list has nothing
 *  RFQ-wide to show in a single "NCC" column. */
export type PurchaseQuotationRow = {
  id: string
  code: string
  status: PurchaseQuotationStatus
  note: string | null
  itemCount: number
  creatorBy: PurchaseQuotationUserRef | null
  sentAt: string | null
  approverBy: PurchaseQuotationUserRef | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}
