import { OrderStatus } from "@/lib/types/order.type"
import type {
  OrderClientRef,
  OrderItemProductRef,
} from "@/lib/types/order.type"

// Backend giờ đã ship module LSX thật (`GET/PATCH /production-orders/:orderId`,
// `POST .../issue`) — nhưng màn danh sách vẫn cố tình chưa đổi sang gọi thẳng API đó, vẫn suy
// trạng thái từ OrderStatus như trước (xem ProductionOrderDecisionStatus bên dưới cho enum thật
// của trang chi tiết). Hai enum này phục vụ 2 khái niệm khác nhau: cái này là góc nhìn suy diễn
// cho hàng-đợi-LSX ở màn danh sách, `ProductionOrderDecisionStatus` là trạng thái thật của một
// LSX cụ thể ở màn chi tiết. Migration 0001 (đã bị drop) từng gọi 2 giá trị này là
// 'pending_lsx' / 'lsx_created'.
export enum ProductionOrderStatus {
  PENDING = "PENDING",
  CREATED = "CREATED",
}

export const PRODUCTION_ORDER_STATUS_LABELS: Record<
  ProductionOrderStatus,
  string
> = {
  [ProductionOrderStatus.PENDING]: "Chờ tạo LSX",
  [ProductionOrderStatus.CREATED]: "Đã tạo LSX",
}

export const PRODUCTION_ORDER_STATUS_TO_ORDER_STATUS: Record<
  ProductionOrderStatus,
  OrderStatus
> = {
  [ProductionOrderStatus.PENDING]: OrderStatus.AWAITING_PRODUCTION,
  [ProductionOrderStatus.CREATED]: OrderStatus.IN_PROGRESS,
}

// The inverse of the map above, for rendering a row's badge. The queue is
// already filtered to one OrderStatus at a time, so every row matches; anything
// else (there shouldn't be one) falls back to "Chờ tạo LSX" rather than a
// missing badge.
export function resolveProductionOrderStatus(
  status: OrderStatus
): ProductionOrderStatus {
  return status === OrderStatus.IN_PROGRESS
    ? ProductionOrderStatus.CREATED
    : ProductionOrderStatus.PENDING
}

// ---- Real LSX decision detail (GET/PATCH /production-orders/:orderId, POST .../issue) ----

/** Mirrors the backend's real `production_orders.status` column — distinct from the derived
 *  `ProductionOrderStatus` above (see the doc comment on that enum). */
export enum ProductionOrderDecisionStatus {
  PENDING = "PENDING",
  ISSUED = "ISSUED",
}

export const PRODUCTION_ORDER_DECISION_STATUS_LABELS: Record<
  ProductionOrderDecisionStatus,
  string
> = {
  [ProductionOrderDecisionStatus.PENDING]: "Chờ duyệt",
  [ProductionOrderDecisionStatus.ISSUED]: "Đã duyệt",
}

/** Mirrors the backend's ProductionOrderItemResDto — one Tab2 row of the decision screen. */
export type ProductionOrderDetailItem = {
  orderItemId: string
  product: OrderItemProductRef
  // SL PO.
  orderQty: number
  // Tồn TP — InventoryService onHand.
  onHandQty: number
  // Khả dụng — onHand trừ reserved của mọi PO khác (loại trừ chính PO đang xem).
  availableQty: number
  // Đề xuất SX — editable, seeded from the formula, saved via PATCH.
  quantity: number
  // Lấy từ tồn — max(0, SL PO - Đề xuất SX).
  fromStockQty: number
}

/** Mirrors the backend's ProductionOrderDetailResDto (Tab1 header + Tab2 `items`). */
export type ProductionOrderDetail = {
  orderId: string
  orderCode: string
  client: OrderClientRef | null
  orderDate: string
  dueDate: string | null
  status: ProductionOrderDecisionStatus
  items: ProductionOrderDetailItem[]
}
