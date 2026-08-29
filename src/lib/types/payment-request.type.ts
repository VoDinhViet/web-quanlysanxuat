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

/** Mirrors the backend's `PaymentRequestPurchaseOrderRefResDto`. */
export type PaymentRequestPoRef = {
  id: string
  code: string
  orderDate: string
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
}
