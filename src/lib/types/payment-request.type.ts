import type { PaymentTerm } from "@/lib/types/payment-term.type"

export const PaymentRequestStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const

export type PaymentRequestStatus =
  (typeof PaymentRequestStatus)[keyof typeof PaymentRequestStatus]

export const paymentRequestStatusLabels: Record<PaymentRequestStatus, string> =
  {
    [PaymentRequestStatus.PENDING]: "Chờ thanh toán",
    [PaymentRequestStatus.PAID]: "Đã thanh toán",
    [PaymentRequestStatus.CANCELLED]: "Đã hủy",
  }

/** Mirrors the backend's `PaymentRequestSupplierRefResDto` (`PickType(SupplierResDto, [...])`) —
 *  `address`/`phoneNumber` are non-null there, only `email` is nullable. */
export type PaymentRequestSupplierRef = {
  id: string
  code: string
  name: string
  address: string
  phoneNumber: string
  email: string | null
}

/** Mirrors the backend's `PaymentRequestPurchaseOrderRefResDto` — `paymentTerm`/`expectedDate`/
 *  `assignedUser` let the detail header explain *why* `dueDate` falls where it does, and who's
 *  handling the PO, without a second query to `purchase-orders`. */
export type PaymentRequestPoRef = {
  id: string
  code: string
  orderDate: string
  paymentTerm: PaymentTerm | null
  expectedDate: string | null
  assignedUser: PaymentRequestUserRef | null
}

/** Mirrors the backend's `UserRefResDto`, nested on `createdBy`/`paidBy`/`cancelledBy` — same
 *  shape as `PurchaseOrderUserRef` (`purchase-order.type.ts`), declared locally per the
 *  "features don't import each other's domain types" convention already applied there. */
export type PaymentRequestUserRef = {
  id: string
  code: string
  fullName: string
}

/** Wire-accurate mirror of `PagePaymentRequestResDto` — the list page's row. */
export type PaymentRequest = {
  id: string
  code: string
  purchaseOrder: PaymentRequestPoRef
  supplier: PaymentRequestSupplierRef
  poValue: number
  requestValue: number
  status: PaymentRequestStatus
  createdAt: string
}

/** One material line inside a payment request — read back from the source PO's items, not
 *  stored on `payment_requests` itself. Mirrors `PaymentRequestItemResDto`. */
export type PaymentRequestItem = {
  id: string
  materialCode: string
  materialName: string
  unit: string
  orderedQty: number
  receivedQty: number
  unitPrice: number
  lineTotal: number
}

/** Wire-accurate mirror of `PaymentRequestResDto` (`GET /payment-requests/:id`) — no
 *  `statusHistory` array on the wire; the sidebar timeline is built client-side from
 *  `createdBy/createdAt`, `paidBy/paidAt`, `cancelledBy/cancelledAt`, see
 *  `payment-request-timeline.ts`. */
export type PaymentRequestDetail = {
  id: string
  code: string
  purchaseOrder: PaymentRequestPoRef
  supplier: PaymentRequestSupplierRef
  poValue: number
  requestValue: number
  dueDate: string
  status: PaymentRequestStatus
  items: PaymentRequestItem[]
  note: string | null
  createdBy: PaymentRequestUserRef | null
  createdAt: string
  paidBy: PaymentRequestUserRef | null
  paidAt: string | null
  cancelledBy: PaymentRequestUserRef | null
  cancelledAt: string | null
  cancellationReason: string | null
}

/** Mirrors the backend's `payment_request_logs.action` column. `CREATED` is the one automatic
 *  milestone (no actor) — a payment request only ever auto-generates, never created by hand. */
export enum PaymentRequestLogAction {
  CREATED = "CREATED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export const paymentRequestLogActionLabels: Record<
  PaymentRequestLogAction,
  string
> = {
  [PaymentRequestLogAction.CREATED]: "Tạo YCTT",
  [PaymentRequestLogAction.PAID]: "Đánh dấu đã TT",
  [PaymentRequestLogAction.CANCELLED]: "Hủy YCTT",
}

/** Mirrors the backend's `PaymentRequestLogResDto` — one row of
 *  `GET /payment-requests/:id/logs`. `content` is already a ready-to-display Vietnamese sentence
 *  generated server-side at write time — not raw data to build a sentence from client-side.
 *  `performerBy` NULL means the automatic `CREATED` milestone, not a deleted user. */
export type PaymentRequestLog = {
  id: string
  action: PaymentRequestLogAction
  content: string
  performerBy: PaymentRequestUserRef | null
  createdAt: string
}
