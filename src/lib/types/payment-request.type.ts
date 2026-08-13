// Mirrors the screenshot's "Yêu cầu thanh toán" (YCTT) domain. Backend endpoint
// not yet available — types declared here so the rest of the feature can be
// strongly-typed even while running on mock data.

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

// Supplier reference nested on a payment request row — kept in this domain
// rather than imported from suppliers, same idiom as OrderClientRef.
export type PaymentRequestSupplierRef = {
  id: string
  name: string
  address: string | null
  phoneNumber: string | null
  email: string | null
}

// PO reference nested on a payment request row.
export type PaymentRequestPoRef = {
  id: string
  code: string
  orderDate: string
}

// List-page row — mirrors what the backend will eventually return for
// GET /api/payment-requests.
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

// One material line inside a payment request.
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

// One entry in the status-change history sidebar.
export type PaymentRequestStatusHistoryEntry = {
  status: PaymentRequestStatus
  changedAt: string
  changedBy: string | null
}

// Detail-page DTO — superset of the list row.
export type PaymentRequestDetail = PaymentRequest & {
  items: PaymentRequestItem[]
  statusHistory: PaymentRequestStatusHistoryEntry[]
  createdBy: string | null
  note: string | null
}
