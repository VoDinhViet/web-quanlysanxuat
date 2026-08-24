// Domain types for Outbound Orders (Giao hàng - DO)

import type { ClientRef } from "@/lib/types/client.type"
import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// Khớp đúng `OutboundOrderStatus` bên BE (be-quanlysanxuat/src/database/schemas/inventory/
// outbound-orders.ts). Service ghi DRAFT (tạo), PENDING_DELIVERY (confirm, gate OQC), DELIVERED
// (deliver, tự trừ tồn + đóng đơn) — xem docs/domains/inventory.md, mục "Giao hàng". Chưa route
// nào ghi PENDING_APPROVAL/CANCELLED — không có duyệt/hủy DO ở BE.
export const OutboundOrderStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PENDING_DELIVERY: "PENDING_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const

export type OutboundOrderStatus =
  (typeof OutboundOrderStatus)[keyof typeof OutboundOrderStatus]

export const outboundOrderStatusLabels: Record<OutboundOrderStatus, string> = {
  [OutboundOrderStatus.DRAFT]: "Nháp",
  [OutboundOrderStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [OutboundOrderStatus.PENDING_DELIVERY]: "Chờ xác nhận giao",
  [OutboundOrderStatus.DELIVERED]: "Đã giao",
  [OutboundOrderStatus.CANCELLED]: "Đã hủy",
}

// Khớp đúng `FulfillmentType` bên BE (cùng file schema) — tên giữ nguyên không tiền tố "Outbound",
// mirror thẳng tên enum BE dùng. Đổi tên từ `DeliveryMethod` (2 giá trị ON_SITE/EXPRESS) sang
// `FulfillmentType` (3 giá trị) khi BE đổi tên field deliveryMethod → fulfillmentType.
export const FulfillmentType = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  PICKUP: "PICKUP",
} as const

export type FulfillmentType =
  (typeof FulfillmentType)[keyof typeof FulfillmentType]

export const fulfillmentTypeLabels: Record<FulfillmentType, string> = {
  [FulfillmentType.STANDARD]: "Giao tận nơi",
  [FulfillmentType.EXPRESS]: "Giao nhanh",
  [FulfillmentType.PICKUP]: "Khách tự đến lấy",
}

// Mirrors PageOutboundOrderResDto (GET /outbound-orders, danh sách) 1:1 — riêng biệt với
// OutboundOrderDetail bên dưới (không compose type này lên cái kia, hai endpoint hiện trả cùng
// field nhưng là hai DTO khác nhau bên BE, sẽ phân kỳ khi phase duyệt/giao được thêm). Không có
// warehouse — BE bỏ warehouseId khỏi outbound_orders.
export type OutboundOrder = {
  id: string
  code: string // e.g. DO-250608-001
  client: ClientRef
  fulfillmentDate: string
  fulfillmentType: FulfillmentType
  status: OutboundOrderStatus
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  updatedAt: string
}

// Mirrors OutboundOrderResDto (GET /outbound-orders/:id) — hiện giống hệt OutboundOrder ở trên
// (BE chưa có field nào riêng cho chi tiết ở phase 1) nhưng khai riêng theo đúng nguyên tắc
// list/detail độc lập (xem outsourcing-order.type.ts).
export type OutboundOrderDetail = {
  id: string
  code: string
  client: ClientRef
  fulfillmentDate: string
  fulfillmentType: FulfillmentType
  status: OutboundOrderStatus
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  updatedAt: string
}

// Mirrors OutboundOrderItemResDto (1 dòng của phiếu — mỗi dòng ứng với 1 dòng PO nguồn).
// `order`/`productionJob` khai inline {id, code} thay vì tái dùng OrderRef/một job-ref type toàn
// cục — cả hai type đó có nhiều field hơn hẳn những gì endpoint này thực sự trả về.
export type OutboundOrderItem = {
  id: string
  order: { id: string; code: string }
  productionJob: { id: string; code: string } | null
  item: ItemRef
  unit: Unit
  quantity: number // SL giao dòng này
  note: string | null
}

// One row per dòng PO chưa hoàn thành, eligible cho bước ① wizard "Tạo phiếu giao hàng" — mirrors
// GET /outbound-orders/unfulfilled-order-items (UnfulfilledOrderItemResDto) 1:1. BE chưa tính
// SL đã giao/tồn TP/đã giữ/có thể giao ở endpoint này (chỉ trả orderedQuantity — SL đặt của dòng
// PO gốc), và chưa lọc theo q/operationId dù DTO có khai (service không dùng tới) — giới hạn thật
// (không vượt SL đặt) được BE kiểm khi tạo phiếu (E193).
export type UnfulfilledOrderItem = {
  orderItemId: string
  client: ClientRef
  order: { id: string; code: string }
  job: { id: string; code: string } | null
  item: ItemRef
  unit: Unit
  orderedQuantity: number
}
