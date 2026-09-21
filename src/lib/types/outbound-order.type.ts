// Domain types for Outbound Orders (Giao hàng - DO)

import type { ClientRef } from "@/lib/types/client.type"
import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// Khớp đúng `OutboundOrderStatus` bên BE (be-quanlysanxuat/src/database/schemas/inventory/
// outbound-orders.ts). Vòng đời: DRAFT --send--> PENDING_APPROVAL --approve--> PENDING_DELIVERY
// --deliver--> DELIVERED (điểm cuối), nhánh PENDING_APPROVAL --reject--> REJECTED --send-->
// PENDING_APPROVAL. Gate OQC (E205) chạy ở cả send và approve. Xem docs/domains/inventory.md,
// mục "Giao hàng". DRAFT/PENDING_APPROVAL/PENDING_DELIVERY --cancel--> CANCELLED (điểm cuối,
// BUG-090); DRAFT có thêm đường xoá hẳn (không qua CANCELLED).
export const OutboundOrderStatus = {
  DRAFT: "DRAFT",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  PENDING_DELIVERY: "PENDING_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
} as const

export type OutboundOrderStatus =
  (typeof OutboundOrderStatus)[keyof typeof OutboundOrderStatus]

export const outboundOrderStatusLabels: Record<OutboundOrderStatus, string> = {
  [OutboundOrderStatus.DRAFT]: "Nháp",
  [OutboundOrderStatus.PENDING_APPROVAL]: "Chờ duyệt",
  [OutboundOrderStatus.PENDING_DELIVERY]: "Chờ xác nhận giao",
  [OutboundOrderStatus.DELIVERED]: "Đã giao",
  [OutboundOrderStatus.CANCELLED]: "Đã hủy",
  [OutboundOrderStatus.REJECTED]: "Bị từ chối",
}

// Sửa (PATCH) chỉ hợp lệ khi còn DRAFT (BE gate E259) — khuôn canUpdateInventoryReceipt.
export function canUpdateOutboundOrder(status: OutboundOrderStatus): boolean {
  return status === OutboundOrderStatus.DRAFT
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
// OutboundOrderDetail bên dưới (không compose type này lên cái kia): list không trả audit trail
// send/approve/reject, chỉ detail mới có. Không có warehouse — BE bỏ warehouseId khỏi
// outbound_orders.
export type OutboundOrder = {
  id: string
  code: string // e.g. DO-250608-001
  client: ClientRef
  fulfillmentDate: string
  fulfillmentType: FulfillmentType
  status: OutboundOrderStatus
  // Mã đơn hàng nguồn — mảng, không phải 1 mã: một DO có thể gộp nhiều dòng PO từ nhiều đơn hàng
  // khác nhau. Rỗng khi phiếu chưa có dòng nào.
  orderCodes: string[]
  totalQuantity: number
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  updatedAt: string
}

// Mirrors OutboundOrderResDto (GET /outbound-orders/:id) — khai riêng theo đúng nguyên tắc
// list/detail độc lập (xem outsourcing-order.type.ts). senderBy/approverBy/rejecterBy (+ *At) là
// audit trail của send/approve/reject; rejectionReason chỉ có ý nghĩa khi status = REJECTED.
export type OutboundOrderDetail = {
  id: string
  code: string
  client: ClientRef
  fulfillmentDate: string
  fulfillmentType: FulfillmentType
  status: OutboundOrderStatus
  note: string | null
  // 4 field vận chuyển (BUG-090, mở rộng theo UI Spec) — tất cả nullable, sửa được ở cả Create
  // lẫn Sửa (edit-inline trên trang Chi tiết).
  deliveryAddress: string | null
  receiverName: string | null
  receiverPhone: string | null
  vehicle: string | null
  creatorBy: UserRef | null
  senderBy: UserRef | null
  sentAt: string | null
  approverBy: UserRef | null
  approvedAt: string | null
  rejecterBy: UserRef | null
  rejectedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

// Mirrors OutboundOrderItemResDto (1 dòng của phiếu — mỗi dòng ứng với 1 dòng PO nguồn).
// `order`/`productionJob` khai inline {id, code} thay vì tái dùng OrderRef/một job-ref type toàn
// cục — cả hai type đó có nhiều field hơn hẳn những gì endpoint này thực sự trả về. 5 field tồn
// kho cuối (BUG-090) cùng khuôn UnfulfilledOrderItem bên dưới — `heldQuantity` đã loại chính
// phiếu đang xem/sửa (BE truyền `excludeOutboundOrderId = outboundOrderId`).
export type OutboundOrderItem = {
  id: string
  order: { id: string; code: string }
  // Dòng PO nguồn (order_items) — round-trip nguyên vẹn khi Sửa (BUG-090), không hiển thị/sửa
  // trực tiếp trên UI.
  orderItemId: string
  productionJob: { id: string; code: string } | null
  item: ItemRef
  unit: Unit
  quantity: number // SL giao dòng này
  note: string | null
  orderedQuantity: number
  issuedQuantity: number
  onHandQuantity: number
  heldQuantity: number
  availableQuantity: number
}

// One row per dòng PO chưa hoàn thành, eligible cho bước ① wizard "Tạo phiếu giao hàng" (và popup
// "Thêm từ PO/Job" khi Sửa) — mirrors GET /outbound-orders/unfulfilled-order-items
// (UnfulfilledOrderItemResDto) 1:1. 5 field tồn kho cuối (BUG-090) — `availableQuantity =
// onHandQuantity − heldQuantity`, chỉ để hiển thị, không thay `E194` (vẫn tính lại ở BE khi lưu).
// Chưa lọc theo q/operationId dù DTO có khai (service không dùng tới) — giới hạn thật (không vượt
// SL đặt) được BE kiểm khi tạo phiếu (E193, dự phòng, chưa route nào ném).
export type UnfulfilledOrderItem = {
  orderItemId: string
  client: ClientRef
  order: { id: string; code: string }
  job: { id: string; code: string } | null
  item: ItemRef
  unit: Unit
  orderedQuantity: number
  issuedQuantity: number
  onHandQuantity: number
  heldQuantity: number
  availableQuantity: number
}
