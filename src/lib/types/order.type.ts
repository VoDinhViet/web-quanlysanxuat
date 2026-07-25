import { DateTime } from "luxon"

export enum OrderStatus {
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  PENDING_PRODUCTION = "PENDING_PRODUCTION",
  PENDING_OUTSOURCING = "PENDING_OUTSOURCING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận",
  [OrderStatus.PENDING_PRODUCTION]: "Chờ sản xuất",
  [OrderStatus.PENDING_OUTSOURCING]: "Chờ OS",
  [OrderStatus.IN_PROGRESS]: "Đang thực hiện",
  [OrderStatus.COMPLETED]: "Hoàn thành",
}

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_CONFIRMATION]: "Chờ xác nhận đơn hàng",
  [OrderStatus.PENDING_PRODUCTION]: "Đang chờ lập kế hoạch sản xuất",
  [OrderStatus.PENDING_OUTSOURCING]: "Đang chờ gia công ngoài",
  [OrderStatus.IN_PROGRESS]: "Đơn hàng đang được xử lý",
  [OrderStatus.COMPLETED]: "Đã giao đủ, kết thúc đơn hàng",
}

// Derived pseudo-status. `isOverdue` is a backend-computed flag on every row,
// not an OrderStatus member — an overdue order keeps its real status, so a row
// can read "Đang thực hiện" next to a red delivery date. These constants exist
// so the legend, the filter select and the stat card share one label.
export const OVERDUE_FILTER_VALUE = "OVERDUE"
export const OVERDUE_LABEL = "Trễ hạn"
export const OVERDUE_DESCRIPTION = "Đơn hàng đã quá ngày giao"

// Payment terms as worded on a sales order. The suppliers slice has a similar
// enum with purchasing wording ("Net 30 ngày"); features must not import each
// other, and promoting to src/lib is an abstraction at the second use.
export enum PaymentTerm {
  IMMEDIATE = "IMMEDIATE",
  NET_15 = "NET_15",
  NET_30 = "NET_30",
  NET_60 = "NET_60",
}

export const PAYMENT_TERM_LABELS: Record<PaymentTerm, string> = {
  [PaymentTerm.IMMEDIATE]: "TT ngay",
  [PaymentTerm.NET_15]: "TT 15 ngày",
  [PaymentTerm.NET_30]: "TT 30 ngày",
  [PaymentTerm.NET_60]: "TT 60 ngày",
}

export type OrderClientRef = {
  id: string
  code: string
  name: string
}

export type OrderSalesRepRef = {
  id: string
  code: string
  fullName: string
}

// Mirrors the backend's OrderResDto.
export type Order = {
  id: string
  code: string
  client: OrderClientRef
  contactName: string | null
  contactPhone: string | null
  orderDate: string
  deliveryDate: string
  totalValue: number
  deliveredValue: number
  // Backend-authoritative: cancelled lines, credit notes and rounding on
  // partial deliveries all move it, so it is not `total - delivered`.
  remainingValue: number
  status: OrderStatus
  // Backend-computed: deliveryDate has passed and the order is not finished.
  // Kept off OrderStatus so a row can be both IN_PROGRESS and overdue.
  isOverdue: boolean
  paymentTerm: PaymentTerm
  salesRep: OrderSalesRepRef | null
  createdAt: string
  updatedAt: string
}

export type OrderStatsPeriod = {
  totalCount: number
  totalValue: number
}

export type OrderStats = {
  totalCount: number
  totalValue: number
  deliveredValue: number
  remainingValue: number
  inProgressCount: number
  overdueCount: number
  completedCount: number
  // Same aggregates for the previous calendar month so the UI can format a real
  // delta instead of inventing one. Null when there is no prior-period data.
  previousMonth: OrderStatsPeriod | null
  // Overdue count as of 7 days ago — the only weekly comparison the UI needs.
  previousWeekOverdueCount: number | null
}

export type OrderFilterOption = {
  id: string
  name: string
}

export type DeliveryTone = "overdue" | "near-due" | "normal"

// Days before deliveryDate at which the date turns orange. Presentation-only.
const NEAR_DUE_DAYS = 3

// `overdue` comes straight off the row because deriving it here would run once
// on the server and again in the browser, possibly in different timezones — a
// hydration mismatch on a red class. Only the softer "near-due" tone is derived,
// where a one-render disagreement is cosmetically harmless.
export function resolveDeliveryTone(order: Order): DeliveryTone {
  if (order.isOverdue) {
    return "overdue"
  }

  if (order.status === OrderStatus.COMPLETED) {
    return "normal"
  }

  const daysLeft = DateTime.fromISO(order.deliveryDate)
    .startOf("day")
    .diff(DateTime.now().startOf("day"), "days").days

  return daysLeft <= NEAR_DUE_DAYS ? "near-due" : "normal"
}
