import type {
  OrderClientRef,
  OrderCreator,
  OrderItemProductRef,
  OrderRef,
} from "@/lib/types/order.type"

/** Mirrors the backend's real `production_orders.status` column (`GET /production-orders`,
 *  `GET /production-orders/:productionOrderId`) — one enum for both the list queue and the
 *  detail snapshot, since both read the same column. `PENDING → APPROVED` is one-way, via
 *  `POST /production-orders/:id/approve` — there is no route back, and no `CANCELLED` value. */
export enum ProductionOrderStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
}

export const productionOrderStatusLabels: Record<
  ProductionOrderStatus,
  string
> = {
  [ProductionOrderStatus.PENDING]: "Chờ duyệt",
  [ProductionOrderStatus.APPROVED]: "Đã duyệt",
}

/** Mirrors the backend's ProductionOrderResDto — one row of `GET /production-orders`, the LSX
 *  queue screen. `id` is the production order's own id (used for `GET /production-orders/:id`);
 *  `orderId`/`orderCode` identify the order it belongs to. No `createdAt`/`creator` — the backend
 *  DTO doesn't expose them, so the queue can't show "Ngày tạo"/"Người tạo" columns. */
export type ProductionOrder = {
  id: string
  code: string | null
  orderId: string
  orderCode: string
  client: OrderClientRef | null
  orderDate: string
  dueDate: string | null
  status: ProductionOrderStatus
  note: string | null
}

/** Mirrors the backend's ProductionOrderItemResDto — one row of the decision table. `quantity`
 *  is seeded from a formula when the order is approved, but stays editable (via `PATCH
 *  /production-orders/:id`) for as long as the header is `PENDING`; `onHandQty`/`availableQty`
 *  are a snapshot taken at that seed time, not recomputed live. */
export type ProductionOrderDetailItem = {
  orderItemId: string
  product: OrderItemProductRef
  // SL PO.
  orderQty: number
  // Tồn TP tại thời điểm duyệt PO.
  onHandQty: number
  // Khả dụng tại thời điểm duyệt PO — onHand trừ reserved của mọi PO khác (loại trừ chính PO
  // đang xem).
  availableQty: number
  // Số lượng sản xuất — sửa được qua PATCH khi LSX còn PENDING, chốt lại khi duyệt LSX.
  quantity: number
  // Lấy từ tồn — max(0, SL PO - Số lượng sản xuất), backend tính lại sau mỗi lần lưu.
  fromStockQty: number
}

/** Mirrors the backend's ProductionOrderDetailResDto, keyed by the production order's own id
 *  (not the order's id). */
export type ProductionOrderDetail = {
  id: string
  // Mã LSX — null cho tới khi duyệt (backend sinh mã lúc đó).
  code: string | null
  status: ProductionOrderStatus
  approvedAt: string | null
  order: OrderRef
  items: ProductionOrderDetailItem[]
}

/** Mirrors the backend's `production_order_logs.action` column. */
export enum ProductionOrderLogAction {
  CREATED = "CREATED",
  QUANTITY_UPDATED = "QUANTITY_UPDATED",
  APPROVED = "APPROVED",
}

export const productionOrderLogActionLabels: Record<
  ProductionOrderLogAction,
  string
> = {
  [ProductionOrderLogAction.CREATED]: "Tạo LSX",
  [ProductionOrderLogAction.QUANTITY_UPDATED]: "Cập nhật SL sản xuất",
  [ProductionOrderLogAction.APPROVED]: "Duyệt LSX",
}

/** Mirrors the backend's ProductionOrderLogResDto — one row of
 *  `GET /production-orders/:productionOrderId/logs`. `content` is already a ready-to-display
 *  Vietnamese sentence generated server-side at write time — not raw data to build a sentence
 *  from client-side. */
export type ProductionOrderLog = {
  id: string
  action: ProductionOrderLogAction
  content: string
  performer: OrderCreator | null
  createdAt: string
}
