import { DateTime } from "luxon"

import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

// Mirrors the backend's OrderStatus exactly — no DRAFT: an order is CONFIRMED the
// moment it's created (see be-quanlysanxuat/src/database/schemas/orders.ts).
export enum OrderStatus {
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.IN_PROGRESS]: "Đang thực hiện",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
}

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  [OrderStatus.CONFIRMED]: "Đơn hàng đã xác nhận, chờ xử lý",
  [OrderStatus.IN_PROGRESS]: "Đơn hàng đang được xử lý",
  [OrderStatus.COMPLETED]: "Đã hoàn thành, kết thúc đơn hàng",
  [OrderStatus.CANCELLED]: "Đơn hàng đã bị hủy",
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

export enum Currency {
  VND = "VND",
  USD = "USD",
  EUR = "EUR",
  JPY = "JPY",
  CNY = "CNY",
  KRW = "KRW",
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  [Currency.VND]: "VND",
  [Currency.USD]: "USD",
  [Currency.EUR]: "EUR",
  [Currency.JPY]: "JPY",
  [Currency.CNY]: "CNY",
  [Currency.KRW]: "KRW",
}

// "Chiết khấu đơn" applies to either the whole order (PERCENT of subtotal, or a flat
// AMOUNT) — see OrdersService.recalculateTotals.
export enum OrderDiscountType {
  PERCENT = "PERCENT",
  AMOUNT = "AMOUNT",
}

export const ORDER_DISCOUNT_TYPE_LABELS: Record<OrderDiscountType, string> = {
  [OrderDiscountType.PERCENT]: "%",
  [OrderDiscountType.AMOUNT]: "Số tiền",
}

// "Bình thường" / "Đã hủy" on a single order line — a cancelled line is excluded
// from `subtotal` server-side.
export enum OrderItemStatus {
  NORMAL = "NORMAL",
  CANCELLED = "CANCELLED",
}

export const ORDER_ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
  [OrderItemStatus.NORMAL]: "Bình thường",
  [OrderItemStatus.CANCELLED]: "Đã hủy",
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

// Mirrors the backend's OrderResDto. There is no per-order delivered/remaining
// amount on the wire yet (only the dashboard stats have a "Đã giao" proxy) —
// don't add those fields back until the backend actually computes them.
export type Order = {
  id: string
  code: string
  client: OrderClientRef
  contactName: string | null
  contactPhone: string | null
  orderDate: string
  dueDate: string | null
  totalVnd: number
  status: OrderStatus
  // Backend-computed: dueDate has passed and the order is not finished.
  // Kept off OrderStatus so a row can be both IN_PROGRESS and overdue.
  expired: boolean
  paymentTerm: PaymentTerm | null
  staff: OrderSalesRepRef | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's nested product relation on an order line (OrderItemProductRefResDto). */
export type OrderItemProductRef = {
  id: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
}

/** Mirrors the backend's OrderItemResDto — one line of an order's product list. */
export type OrderItem = {
  id: string
  quantity: number
  unitPrice: number
  discountPercent: number
  // Server-computed: quantity * unitPrice * (1 - discountPercent / 100).
  lineTotal: number
  note: string | null
  status: OrderItemStatus
  sortOrder: number
  product: OrderItemProductRef
}

/** Mirrors the backend's OrderAttachmentResDto — a join row carrying the registry file it points at. */
export type OrderAttachment = {
  id: string
  file: FileResource
}

/** Mirrors the backend's nested creator relation (OrderCreatorResDto). */
export type OrderCreator = {
  id: string
  username: string
}

// Mirrors the backend's OrderResDto in full — GET /api/orders/:id only. The list
// endpoint (GET /api/orders, `Order` above) intentionally skips items/attachments
// for query performance (see OrdersService.getOrders vs. getOrderDetail), so this
// extends `Order` rather than folding everything onto one shared type.
export type OrderDetail = Order & {
  contactEmail: string | null
  deliveryAddress: string | null
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
  items: OrderItem[]
  attachments: OrderAttachment[]
  creator: OrderCreator | null
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

export type OrderFilterOption = {
  id: string
  name: string
}

export type DeliveryTone = "overdue" | "near-due" | "normal"

// Days before dueDate at which the date turns orange. Presentation-only.
const NEAR_DUE_DAYS = 3

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

  return daysLeft <= NEAR_DUE_DAYS ? "near-due" : "normal"
}
