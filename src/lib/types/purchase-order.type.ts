import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

/** Mirrors the backend's `purchase_orders.status` column exactly — only 3 values are ever
 *  stored (`be-quanlysanxuat/src/database/schemas/purchasing/purchase-orders.ts`). "Đang nhận
 *  hàng"/"Hoàn tất" are NOT stored here — they're derived at read time from `receivedQuantity`,
 *  see `PurchaseOrderProgress` below. Used for display on the PO detail page
 *  (`PurchaseOrderStatusBadge`, `purchase-orders/components/PurchaseOrderBadges.tsx`) — the list
 *  page still reads the synthetic 5-value `PurchaseOrderProgress` below instead. */
export const PurchaseOrderStatus = {
  DRAFT: "DRAFT",
  ORDERED: "ORDERED",
  CANCELLED: "CANCELLED",
} as const

export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus]

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.DRAFT]: "Nháp",
  [PurchaseOrderStatus.ORDERED]: "Đã đặt hàng",
  [PurchaseOrderStatus.CANCELLED]: "Đã hủy",
}

export const purchaseOrderStatusDescriptions: Record<
  PurchaseOrderStatus,
  string
> = {
  [PurchaseOrderStatus.DRAFT]: "Đang soạn, chưa đặt với NCC",
  [PurchaseOrderStatus.ORDERED]: "Đã đặt với NCC, chờ nhận hàng",
  [PurchaseOrderStatus.CANCELLED]: "Đơn đã bị hủy",
}

/** Mirrors the backend's `payment_term` pg enum (`be-quanlysanxuat/src/database/schemas/
 *  suppliers/supplier-payment-info.ts`), reused as-is on `purchase_orders.paymentTerm`. Declared
 *  locally here rather than imported from `supplier.type.ts`/`order.type.ts` — same "features
 *  must not import each other" convention already applied between those two (see `order.type.ts`'s
 *  comment on its own `PaymentTerm`). Wording follows `supplier.type.ts`'s "Net X ngày" style
 *  (điều khoản trả cho NCC — cùng miền nghiệp vụ mua hàng), not `order.type.ts`'s "TT X ngày"
 *  (điều khoản thu từ khách hàng). */
export const PaymentTerm = {
  IMMEDIATE: "IMMEDIATE",
  NET_15: "NET_15",
  NET_30: "NET_30",
  NET_60: "NET_60",
} as const

export type PaymentTerm = (typeof PaymentTerm)[keyof typeof PaymentTerm]

export const paymentTermLabels: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "Thanh toán ngay",
  [PaymentTerm.NET_15]: "Net 15 ngày",
  [PaymentTerm.NET_30]: "Net 30 ngày",
  [PaymentTerm.NET_60]: "Net 60 ngày",
}

/** What the UI actually shows/filters by — `docs/domains/purchasing.md` (backend repo) flags
 *  "thinking `purchase_orders.status` has `RECEIVING`/`COMPLETED`" as pitfall #1 of this domain,
 *  so this is deliberately a separate type from `PurchaseOrderStatus`, not a superset reusing its
 *  values. Computed by the backend (`PurchaseOrdersService.resolveOrderProgress`) from `status` +
 *  `receivedQuantity`/`orderedQuantity` and sent as-is on `PurchaseOrder.progress` — not a
 *  stored column, and not re-derived client-side. */
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
  receiptWarehouse: WarehouseRef | null
  itemCount: number
  totalAmount: number
  progress: PurchaseOrderProgress
  purchaseRequests: PurchaseOrderSourceRef[]
  quotation: PurchaseOrderSourceRef | null
  ordererBy: PurchaseOrderUserRef | null
  orderedAt: string | null
  cancellerBy: PurchaseOrderUserRef | null
  cancelledAt: string | null
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
  quantityAdjustmentReason: string | null
  unitPrice: number | null
  note: string | null
  purchaseRequestItem: {
    id: string
    quantity: number
    purchaseRequest: { id: string; code: string }
    item: { id: string; code: string; name: string; unit: Unit }
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
  orderDate: string
  expectedDate: string | null
  assignedUser: PurchaseOrderUserRef | null
  paymentTerm: PaymentTerm | null
  receiptWarehouse: WarehouseRef | null
  note: string | null
  quotation: { id: string; code: string } | null
  items: PurchaseOrderItemDetail[]
  ordererBy: PurchaseOrderUserRef | null
  orderedAt: string | null
  cancellerBy: PurchaseOrderUserRef | null
  cancelledAt: string | null
  cancellationReason: string | null
  creatorBy: PurchaseOrderUserRef | null
  createdAt: string
  updatedAt: string
}

/** Declared locally rather than shared with `purchase-quotation.type.ts`'s equivalent — same
 *  "domain types don't cross features" convention already applied to that pair. */
export type PurchaseOrderTimelineStepState =
  | "done"
  | "current"
  | "upcoming"
  | "cancelled"

export type PurchaseOrderTimelineStep = {
  key: string
  label: string
  state: PurchaseOrderTimelineStepState
  timestamp: string | null
  actor: string | null
  detail: string | null
}
