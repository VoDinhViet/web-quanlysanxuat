import type { FileResource } from "@/lib/types/file.type"
import type { PaymentTerm } from "@/lib/types/payment-term.type"
import type { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `purchase_orders.status` column exactly — only 3 values are ever
 *  stored (`be-quanlysanxuat/src/database/schemas/purchasing/purchase-orders.ts`). "Đang nhận
 *  hàng"/"Hoàn tất" are NOT stored here — they're derived at read time from `receivedQuantity`,
 *  see `PurchaseOrderProgress` below. Used for display on the PO detail page
 *  (`PurchaseOrderStatusBadge`, `purchase-orders/components/PurchaseOrderBadges.tsx`) — the list
 *  page still reads the synthetic 5-value `PurchaseOrderProgress` below instead. */
export const PurchaseOrderStatus = {
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  ORDERED: "ORDERED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [PurchaseOrderStatus.ORDERED]: "Đã đặt hàng",
  [PurchaseOrderStatus.CANCELLED]: "Đã hủy",
}

export const purchaseOrderStatusDescriptions: Record<
  PurchaseOrderStatus,
  string
> = {
  [PurchaseOrderStatus.PENDING_CONFIRMATION]:
    "Chờ xác nhận để đặt hàng với NCC",
  [PurchaseOrderStatus.ORDERED]: "Đã đặt với NCC, chờ nhận hàng",
  [PurchaseOrderStatus.CANCELLED]: "Đơn đã bị hủy",
}

/** What the UI actually shows/filters by — `docs/domains/purchasing.md` (backend repo) flags
 *  "thinking `purchase_orders.status` has `RECEIVING`/`COMPLETED`" as pitfall #1 of this domain,
 *  so this is deliberately a separate type from `PurchaseOrderStatus`, not a superset reusing its
 *  values. Computed by the backend (`PurchaseOrdersService.resolveOrderProgress`) from `status` +
 *  `receivedQuantity`/`orderedQuantity` and sent as-is on `PurchaseOrder.progress` — not a
 *  stored column, and not re-derived client-side. */
export const PurchaseOrderProgress = {
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
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
  [PurchaseOrderProgress.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [PurchaseOrderProgress.ORDERED]: "Đã đặt hàng",
  [PurchaseOrderProgress.RECEIVING]: "Đang nhận hàng",
  [PurchaseOrderProgress.COMPLETED]: "Hoàn tất",
  [PurchaseOrderProgress.CANCELLED]: "Đã hủy",
}

export const purchaseOrderProgressDescriptions: Record<
  PurchaseOrderProgress,
  string
> = {
  [PurchaseOrderProgress.PENDING_CONFIRMATION]:
    "Chờ xác nhận để đặt hàng với NCC",
  [PurchaseOrderProgress.ORDERED]: "Đã đặt với NCC, chưa nhận hàng",
  [PurchaseOrderProgress.RECEIVING]: "Đã nhận một phần",
  [PurchaseOrderProgress.COMPLETED]: "Đã nhận đủ số lượng đặt",
  [PurchaseOrderProgress.CANCELLED]: "Đơn đã bị hủy",
}

/** A quotation/purchase-request a PO's lines trace back to — declared locally rather than
 *  imported from `purchase-request.type.ts`, same idiom as `PurchaseLedgerPurchaseRequestRef`.
 *  A PO has no header-to-header FK to either: it only links at the line level
 *  (`purchase_order_items.purchaseRequestItemId`/`quotationItemId`), and one PO can gather lines
 *  from several different PRs as long as they share a supplier — hence the array on
 *  `PurchaseOrder.purchaseRequests` below (a PO has only one source RFQ, so `quotation` there
 *  is a single ref instead). */
export type PurchaseOrderSourceRef = {
  id: string
  code: string
}

/** Mirrors the backend's `UserRefResDto`, nested on `ordererBy`/`cancellerBy`/`creatorBy` — not
 *  just "creator" (renamed from `PurchaseOrderCreatorRef`, which only fit the mock's single
 *  `creator` field). */
export type PurchaseOrderUserRef = {
  id: string
  code: string
  fullName: string
}

/** Wire-accurate mirror of `PagePurchaseOrderResDto`
 *  (`be-quanlysanxuat/src/api/purchase-orders/dto/page-purchase-order.res.dto.ts`) — the PO list
 *  page's row, and also what the RFQ detail page's "Đơn mua đã sinh" card reads off
 *  `GET /purchase-orders?quotationId=...` (same DTO, narrower query). `progress` is computed by
 *  the backend, not re-derived client-side (see `PurchaseOrderProgress` above). The list DTO
 *  carries `itemCount`/`totalAmount` (computed aggregates), not a full `items[]` array — unlike
 *  the detail DTO (`PurchaseOrderDetail` below). */
export type PurchaseOrder = {
  id: string
  code: string
  supplier: SupplierRef
  status: PurchaseOrderStatus
  orderDate: string
  expectedDate: string | null
  assignedUser: PurchaseOrderUserRef | null
  paymentTerm: PaymentTerm | null
  itemCount: number
  totalAmount: number
  progress: PurchaseOrderProgress
  purchaseRequests: PurchaseOrderSourceRef[]
  quotation: PurchaseOrderSourceRef | null
  ordererBy: PurchaseOrderUserRef | null
  orderedAt: string | null
  cancellerBy: PurchaseOrderUserRef | null
  cancelledAt: string | null
  /** Set when the PO was closed early (received part of the order, the rest is not coming) —
   *  `status` stays ORDERED, `progress` becomes COMPLETED. */
  closedAt: string | null
  creatorBy: PurchaseOrderUserRef | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's `PurchaseOrderItemResDto`, nested on `PurchaseOrderDetail.items` below —
 *  one PO line, sourced from exactly one đề xuất mua hàng (PR) line. `note` is currently always
 *  `null`: no route (including PO auto-generation from an approved RFQ) ever writes it — only
 *  `quantityAdjustmentReason` is editable, via `updatePurchaseOrderItem`. */
export type PurchaseOrderItemDetail = {
  id: string
  quantity: number
  receivedQuantity: number
  /** Tồn thực tế hiện tại của vật tư (gộp mọi kho). */
  onHand: number
  quantityAdjustmentReason: string | null
  unitPrice: number | null
  note: string | null
  purchaseRequestItem: {
    id: string
    quantity: number
    /** Ghi chú dòng ĐXMH nguồn — đi xuyên sang ĐMH/phiếu nhập/IQC (`note` của chính dòng PO luôn null). */
    note: string | null
    purchaseRequest: { id: string; code: string }
    item: {
      id: string
      code: string
      name: string
      unit: Unit
      image?: FileResource | null
    }
  }
}

/** Mirrors the backend's `PurchaseOrderResDto` (`GET /purchase-orders/:id`) field-for-field — the
 *  PO detail page's read. This is now a dedicated detail DTO, distinct from the list's
 *  `PagePurchaseOrderResDto` (which carries `itemCount`/`totalAmount` aggregates instead of full
 *  `items`/`note`/`cancellationReason`) — mirror `purchase-quotations`'s list/detail split, not
 *  the single-DTO shape this used to reuse. `quotation` is the single RFQ this PO was generated
 *  from — `null` only if the RFQ link was cleared (`onDelete: set null`); a PO's items still
 *  reference their originating PR at the line level even then. */
export type PurchaseOrderDetail = {
  id: string
  code: string
  supplier: SupplierRef
  status: PurchaseOrderStatus
  /** Same value the list shows (`PurchaseOrder.progress`) — computed by the backend. */
  progress: PurchaseOrderProgress
  orderDate: string
  expectedDate: string | null
  assignedUser: PurchaseOrderUserRef | null
  paymentTerm: PaymentTerm | null
  note: string | null
  /** Tiền hàng chưa thuế (Σ SL đặt × đơn giá), tính ở BE. */
  subtotal: number
  /** Thuế VAT (%) trên tiền hàng, nhập ở PO. */
  vatPercent: number
  vatAmount: number
  /** Chi phí khác của cả đơn (vận chuyển, bốc xếp...) + diễn giải. */
  otherCost: number
  otherCostNote: string | null
  /** Tổng tiền = subtotal + vatAmount + otherCost — số mà yêu cầu thanh toán chốt. */
  totalAmount: number
  quotation: { id: string; code: string } | null
  quotationStatus: PurchaseQuotationStatus | null
  /** True when cancelling can also reopen the source RFQ (`reopenQuotation`): the RFQ is
   *  APPROVED and none of its other POs is ORDERED. */
  canReopenQuotation: boolean
  /** Other ORDERED POs of the same RFQ — the reason `canReopenQuotation` is false. */
  reopenBlockedBy: { id: string; code: string }[]
  items: PurchaseOrderItemDetail[]
  ordererBy: PurchaseOrderUserRef | null
  orderedAt: string | null
  cancellerBy: PurchaseOrderUserRef | null
  cancelledAt: string | null
  cancellationReason: string | null
  closerBy: PurchaseOrderUserRef | null
  closedAt: string | null
  closureReason: string | null
  /** Partially received, not yet closed, and no unposted receipt in the way. */
  canClose: boolean
  /** Unposted receipts (DRAFT/PENDING_*) blocking an otherwise possible early close. */
  closeBlockedBy: { id: string; code: string }[]
  creatorBy: PurchaseOrderUserRef | null
  createdAt: string
  updatedAt: string
}
