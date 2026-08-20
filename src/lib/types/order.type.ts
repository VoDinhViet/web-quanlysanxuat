import { DateTime } from "luxon"

import type { FileResource } from "@/lib/types/file.type"
import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"

// Mirrors the backend's OrderStatus exactly. DRAFT → PENDING_CONFIRMATION (submit) →
// AWAITING_PRODUCTION (director approve only, never a direct PATCH) → IN_PROGRESS →
// COMPLETED/CANCELLED. A reject sends PENDING_CONFIRMATION to REJECTED; editing a REJECTED
// order without changing `status` reverts it to DRAFT, or it can be resubmitted straight to
// PENDING_CONFIRMATION without editing anything.
export const OrderStatus = {
  DRAFT: "DRAFT",
  PENDING_CONFIRMATION: "PENDING_CONFIRMATION",
  REJECTED: "REJECTED",
  AWAITING_PRODUCTION: "AWAITING_PRODUCTION",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: "Nháp",
  [OrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [OrderStatus.REJECTED]: "Từ chối",
  [OrderStatus.AWAITING_PRODUCTION]: "Chờ sản xuất",
  [OrderStatus.IN_PROGRESS]: "Đang thực hiện",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
}

export const orderStatusDescriptions: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: "Đơn nháp, sửa tự do, chưa gửi duyệt",
  [OrderStatus.PENDING_CONFIRMATION]: "Đã gửi, chờ Giám đốc duyệt",
  [OrderStatus.REJECTED]: "Giám đốc từ chối — sửa lại sẽ tự về Nháp",
  [OrderStatus.AWAITING_PRODUCTION]: "Đã duyệt, chờ đưa vào sản xuất",
  [OrderStatus.IN_PROGRESS]: "Đơn hàng đang được xử lý",
  [OrderStatus.COMPLETED]: "Đã hoàn thành, kết thúc đơn hàng",
  [OrderStatus.CANCELLED]: "Đơn hàng đã bị hủy",
}

// Statuses where the order can no longer be edited: PENDING_CONFIRMATION (already sent for
// director approval — editing now would change the ground under the approver), everything from
// AWAITING_PRODUCTION onward (once approved, the order is locked for good — there is no editable
// status past this point), plus the two terminal statuses. REJECTED stays editable on purpose —
// editing it (without changing `status`) is exactly how it reverts to DRAFT. Shared by both
// "Chỉnh sửa" buttons and the update route's loader guard so all three stay in sync by
// construction instead of by duplicated status literals.
const notUpdatableStatuses: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.PENDING_CONFIRMATION,
  OrderStatus.AWAITING_PRODUCTION,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
])

export function canUpdateOrder(status: OrderStatus): boolean {
  return !notUpdatableStatuses.has(status)
}

// Only meaningful when canUpdateOrder(status) is false — callers only read this inside that
// branch (see OrderDetailActions.tsx / OrderTableCells.tsx).
export function resolveOrderUpdateDisabledHint(status: OrderStatus): string {
  if (status === OrderStatus.PENDING_CONFIRMATION) {
    return "Đơn hàng đã gửi duyệt, đang chờ xác nhận nên không thể chỉnh sửa"
  }
  if (
    status === OrderStatus.AWAITING_PRODUCTION ||
    status === OrderStatus.IN_PROGRESS
  ) {
    return "Đơn hàng đã được duyệt nên không thể chỉnh sửa"
  }
  return "Đơn hàng đã hoàn thành hoặc đã hủy nên không thể chỉnh sửa"
}

// Derived pseudo-status. `expired` is a backend-computed flag on every row, not an
// OrderStatus member — an overdue order keeps its real status, so a row can read "Đang thực
// hiện" next to a red delivery date. The backend has no `overdue` list filter (only
// `expired` on each row), so this is display-only now — the status legend and the badge's
// tone map, not a selectable filter option.
export const overdueTone = "OVERDUE"
export const overdueLabel = "Trễ hạn"
export const overdueDescription = "Đơn hàng đã quá ngày giao"

// Payment terms as worded on a sales order. The suppliers slice has a similar
// enum with purchasing wording ("Net 30 ngày"); features must not import each
// other, and promoting to src/lib is an abstraction at the second use.
export const PaymentTerm = {
  IMMEDIATE: "IMMEDIATE",
  NET_15: "NET_15",
  NET_30: "NET_30",
  NET_60: "NET_60",
} as const

export type PaymentTerm = (typeof PaymentTerm)[keyof typeof PaymentTerm]

export const paymentTermLabels: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "TT ngay",
  [PaymentTerm.NET_15]: "TT 15 ngày",
  [PaymentTerm.NET_30]: "TT 30 ngày",
  [PaymentTerm.NET_60]: "TT 60 ngày",
}

export const Currency = {
  VND: "VND",
  USD: "USD",
  EUR: "EUR",
  JPY: "JPY",
  CNY: "CNY",
  KRW: "KRW",
} as const

export type Currency = (typeof Currency)[keyof typeof Currency]

export const currencyLabels: Record<Currency, string> = {
  [Currency.VND]: "VND",
  [Currency.USD]: "USD",
  [Currency.EUR]: "EUR",
  [Currency.JPY]: "JPY",
  [Currency.CNY]: "CNY",
  [Currency.KRW]: "KRW",
}

// "Chiết khấu đơn" applies to either the whole order (PERCENT of subtotal, or a flat
// AMOUNT) — see OrdersService.recalculateTotals.
export const OrderDiscountType = {
  PERCENT: "PERCENT",
  AMOUNT: "AMOUNT",
} as const

export type OrderDiscountType =
  (typeof OrderDiscountType)[keyof typeof OrderDiscountType]

export const orderDiscountTypeLabels: Record<OrderDiscountType, string> = {
  [OrderDiscountType.PERCENT]: "%",
  [OrderDiscountType.AMOUNT]: "Số tiền",
}

// "Bình thường" / "Đã hủy" on a single order line — a cancelled line is excluded
// from `subtotal` server-side.
export const OrderItemStatus = {
  NORMAL: "NORMAL",
  CANCELLED: "CANCELLED",
} as const

export type OrderItemStatus =
  (typeof OrderItemStatus)[keyof typeof OrderItemStatus]

export const orderItemStatusLabels: Record<OrderItemStatus, string> = {
  [OrderItemStatus.NORMAL]: "Bình thường",
  [OrderItemStatus.CANCELLED]: "Đã hủy",
}

// Mirrors the backend's ClientBaseResDto (a subset — orders only ever nest this much of a
// client). taxCode/phoneNumber/email/address are what the order detail page now reads for
// "contact" info, since the order itself no longer snapshots a contact (see `Order` below).
export type OrderClientRef = {
  id: string
  code: string
  name: string
  taxCode: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
}

/** Mirrors the backend's UserRefResDto — shared by every order-level user relation
 *  (assignedUser, creatorBy, approverBy, rejecterBy). */
export type OrderUserRef = {
  id: string
  code: string
  fullName: string
}

/** Lightweight order reference nested inside another module's response DTO (e.g.
 *  `ProductionOrderDetail.order`, `ProductionJobDetail.order`) — a subset of the backend's
 *  `OrderBaseResDto`. */
export type OrderRef = {
  id: string
  code: string
  client: OrderClientRef | null
  orderDate: string
  dueDate: string | null
  note: string | null
}

// Mirrors the backend's OrderResDto. There is no per-order delivered/remaining
// amount on the wire yet (only the dashboard stats have a "Đã giao" proxy) —
// don't add those fields back until the backend actually computes them.
// No `contactName`/`contactPhone` snapshot anymore — the backend dropped it, contact info
// now reads through `client` instead (see OrderClientRef).
export type Order = {
  id: string
  code: string
  // `clientId` is temporarily optional on create (docs/domains/orders.md), so a real order
  // can have no client — every consumer must guard this, not just chain `.client.*`.
  client: OrderClientRef | null
  orderDate: string
  dueDate: string | null
  totalVnd: number
  status: OrderStatus
  // Backend-computed: dueDate has passed and the order is not finished.
  // Kept off OrderStatus so a row can be both IN_PROGRESS and overdue.
  expired: boolean
  paymentTerm: PaymentTerm | null
  assignedUser: OrderUserRef | null
  creatorBy: OrderUserRef | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's OrderItemRefResDto — a different, older nested-item shape than the
 *  order-item endpoint below uses now. Kept only because `ProductionOrderDetailItem`
 *  (production-order.type.ts) still nests `unit`/`image` inside `item` for its own resource
 *  (ProductionOrderItemResDto) — not used by `OrderItem` itself anymore, see its own doc comment.
 */
export type OrderItemRef = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
}

/** Mirrors the backend's OrderItemResDto — one line of an order's item list (GET
 *  /api/orders/:orderId/items, a separate endpoint from the order detail — see `OrderDetail`
 *  below). `unit`/`image` are top-level siblings of `item`, not nested inside it — `item` itself
 *  is just the lightweight {id, code, name} `ItemRef`. */
export type OrderItem = {
  id: string
  quantity: number
  // Server-computed from inventory_transactions.orderItemId — the line's real issued/delivered
  // quantity so far.
  issuedQty: number
  // Server-computed: quantity - issuedQty. Can go negative if the line was over-issued.
  remainingQty: number
  unitPrice: number
  discountPercent: number
  // Server-computed: quantity * unitPrice * (1 - discountPercent / 100).
  lineTotal: number
  note: string | null
  status: OrderItemStatus
  sortOrder: number
  item: ItemRef
  unit: Unit
  image: FileResource | null
}

/** Mirrors the backend's OrderAttachmentResDto — a join row carrying the registry file it points at. */
export type OrderAttachment = {
  id: string
  file: FileResource
}

// Mirrors the backend's OrderPaymentStatus — computed at read time (SUM(order_payments.amount)
// vs. order.total), not a stored column.
export const OrderPaymentStatus = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
} as const

export type OrderPaymentStatus =
  (typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus]

export const orderPaymentStatusLabels: Record<OrderPaymentStatus, string> = {
  [OrderPaymentStatus.UNPAID]: "Chưa thanh toán",
  [OrderPaymentStatus.PARTIAL]: "Thanh toán một phần",
  [OrderPaymentStatus.PAID]: "Đã thanh toán",
}

/** Mirrors the backend's OrderPaymentResDto — one row of an order's payment ledger (GET/POST
 *  /api/orders/:orderId/payments). Append-only: a correction is a new negative-`amount` row,
 *  never an edit/delete of an existing one. `amount` is in the order's own currency, the same
 *  one `total`/`paidAmount` are in — not VND. */
export type OrderPayment = {
  id: string
  amount: number
  paidAt: string
  note: string | null
  creatorBy: OrderUserRef | null
  createdAt: string
}

// Mirrors the backend's OrderResDto in full — GET /api/orders/:id only. The list
// endpoint (GET /api/orders, `Order` above) intentionally skips items/attachments
// for query performance (see OrdersService.getOrders vs. getOrderDetail), so this
// extends `Order` rather than folding everything onto one shared type. Items are their own
// endpoint too — GET /api/orders/:id/items, `OrderItem` above — no longer embedded here.
export type OrderDetail = Order & {
  consigneeAddress: string | null
  currency: Currency
  exchangeRate: number
  // Tổng tiền hàng — server-computed sum of non-cancelled line totals.
  subtotal: number
  discountType: OrderDiscountType
  discountValue: number
  // Chiết khấu đơn quy đổi ra tiền — server-computed.
  discountAmount: number
  vatPercent: number
  // Tiền thuế VAT — server-computed.
  vatAmount: number
  shippingFee: number
  // TỔNG THANH TOÁN — server-computed: subtotal - discountAmount + vatAmount + shippingFee.
  total: number
  note: string | null
  internalNote: string | null
  attachments: OrderAttachment[]
  // Approval flow (see OrderStatus doc comment) — only the most recent approve/reject is
  // kept, no history table.
  approverBy: OrderUserRef | null
  approvedAt: string | null
  rejecterBy: OrderUserRef | null
  rejectedAt: string | null
  rejectionReason: string | null
  // Tổng đã trả — server-computed: SUM(order_payments.amount).
  paidAmount: number
  // Server-computed at read time from paidAmount vs. total — not a stored column.
  paymentStatus: OrderPaymentStatus
}

// Mirrors the backend's OrderStatsResDto exactly (the 6 dashboard cards). Trend/ratio
// math is fully backend-computed — the FE only formats and colors what it's given.
export type OrderStats = {
  totalOrders: number
  totalOrdersTrendPercent: number | null
  totalValue: number
  totalValueTrendPercent: number | null
  // "Đã giao" — proxy until real delivery/DO tracking exists: sum(total) of COMPLETED orders.
  completedValue: number
  completedValuePercentOfTotal: number
  inProgress: number
  inProgressPercentOfTotal: number
  expired: number
  // expired now minus expired 7 days ago (approximated against today's status).
  expiredTrendCount: number
  completed: number
  completedPercentOfTotal: number
}

export type DeliveryTone = "overdue" | "near-due" | "normal"

// Days before dueDate at which the date turns orange. Presentation-only.
const nearDueDays = 3

// `overdue` comes straight off the row because deriving it here would run once
// on the server and again in the browser, possibly in different timezones — a
// hydration mismatch on a red class. Only the softer "near-due" tone is derived,
// where a one-render disagreement is cosmetically harmless.
export function resolveDeliveryTone(order: Order): DeliveryTone {
  if (order.expired) {
    return "overdue"
  }

  if (order.status === OrderStatus.COMPLETED || order.dueDate === null) {
    return "normal"
  }

  const daysLeft = DateTime.fromISO(order.dueDate)
    .startOf("day")
    .diff(DateTime.now().startOf("day"), "days").days

  return daysLeft <= nearDueDays ? "near-due" : "normal"
}

// Built by src/features/orders/order-timeline.ts from real OrderDetail fields
// (createdAt/creator, approvedAt/approver, rejectedAt/rejecter, updatedAt) — no mock data.
export type OrderTimelineStepState =
  | "done"
  | "current"
  | "upcoming"
  | "cancelled"

export type OrderTimelineStep = {
  key: string
  label: string
  state: OrderTimelineStepState
  timestamp: string | null
  actor: string | null
  detail: string | null
}

// ---- UI-only mock scaffolding ----
// The 2 types below describe placeholder data built by
// src/features/orders/mock/order-detail.mock.ts for the one concept the backend still has no
// table for: order-level delivery/DO history. (Payment history used to be mock too — now real,
// see OrderPayment above.) Delete these alongside that file once DO tracking exists.

export type OrderMockDeliveryProgress = {
  deliveredPercent: number
  deliveredQuantity: number
  remainingQuantity: number
  deliveredVnd: number
  remainingVnd: number
}

export type OrderMockDeliveryRow = {
  code: string
  deliveredAt: string
  quantity: number
  valueVnd: number
  vehicle: string
}
