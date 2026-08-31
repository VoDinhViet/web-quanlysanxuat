// Domain types for Gia công ngoài — Xuất đi gia công (OS-OUT).

import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// Khớp `OutsourcingOrderStatus` bên BE (be-quanlysanxuat/src/database/schemas/inventory/
// outsourcing-orders.ts) — vừa là trạng thái chứng từ vừa là tiến độ nhận hàng, gộp làm một cột
// DB (`docs/decisions/outsourcing-order-status-progress-merge.md` phía be-quanlysanxuat), không
// còn 2 khái niệm tách riêng. `SENT` set thẳng lúc tạo (không có nháp,
// `docs/decisions/outsourcing-no-draft.md`) — không có DRAFT trong enum này. BE cũng không tính
// "quá hạn" thành 1 giá trị riêng nên không có OVERDUE.
export const OutsourcingOrderStatus = {
  SENT: "SENT",
  PARTIAL: "PARTIAL",
  WAITING_QC: "WAITING_QC",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type OutsourcingOrderStatus =
  (typeof OutsourcingOrderStatus)[keyof typeof OutsourcingOrderStatus]

export const outsourcingOrderStatusLabels: Record<
  OutsourcingOrderStatus,
  string
> = {
  [OutsourcingOrderStatus.SENT]: "Đang gia công",
  [OutsourcingOrderStatus.PARTIAL]: "Về 1 phần",
  [OutsourcingOrderStatus.WAITING_QC]: "Chờ QC",
  [OutsourcingOrderStatus.COMPLETED]: "Hoàn thành",
  [OutsourcingOrderStatus.CANCELLED]: "Đã hủy",
}

// Mô tả dài cho Legend (OutsourcingOrderLegend.tsx) — cùng khuôn `purchaseOrderProgressDescriptions`
// (purchase-order.type.ts).
export const outsourcingOrderStatusDescriptions: Record<
  OutsourcingOrderStatus,
  string
> = {
  [OutsourcingOrderStatus.SENT]: "Đã gửi, chưa nhận được dòng nào",
  [OutsourcingOrderStatus.PARTIAL]: "Đã nhận một phần, còn dòng chưa đủ",
  [OutsourcingOrderStatus.WAITING_QC]: "Đã nhận đủ, còn IQC chưa xong",
  [OutsourcingOrderStatus.COMPLETED]: "Đã nhận đủ, IQC đã xong (hoặc không cần IQC)",
  [OutsourcingOrderStatus.CANCELLED]: "Phiếu đã bị hủy",
}

// Mirrors PageOutsourcingOrderResDto (GET /outsourcing-orders, danh sách) 1:1 — riêng biệt với
// OutsourcingOrderDetail bên dưới (không compose type này lên cái kia): hai endpoint khác nhau
// thật sự.
export type OutsourcingOrder = {
  id: string
  code: string // e.g. OS-OUT-0001
  supplier: SupplierRef
  sendDate: string
  expectedReturnDate: string | null // có thể chưa đặt
  status: OutsourcingOrderStatus
  note: string | null
  creatorBy: UserRef | null
  totalQuantity: number // Tổng SL gửi mọi dòng
  receivedQuantity: number // Tổng SL đã nhận mọi dòng (phiếu OS-IN POSTED)
  remainingQuantity: number // = totalQuantity - receivedQuantity, BE tính sẵn
  createdAt: string
  updatedAt: string
}

// Mirrors OutsourcingOrderItemResDto (1 dòng của phiếu — mỗi dòng 1 công đoạn/vật tư). `unit` là
// field riêng, không lồng trong `item` (BE tách ItemRefResDto/UnitResDto thay vì
// ItemUnitRefResDto trước đây). plannedQuantity/sentBeforeQuantity là snapshot lúc gửi, chỉ để
// hiển thị/in — không dùng để validate lại.
export type OutsourcingOrderItem = {
  id: string
  item: { id: string; code: string; name: string }
  unit: Unit
  productionJob: { id: string; code: string } | null
  operationCode: string
  operationName: string
  quantity: number // SL gửi dòng này
  receivedQuantity: number // SL đã nhận (Σ dòng OS-IN POSTED trỏ dòng này)
  plannedQuantity: number | null
  sentBeforeQuantity: number | null
  weight: number | null
  area: number | null
  note: string | null
}

// Mirrors OutsourcingOrderResDto (GET /outsourcing-orders/:id) — riêng biệt với OutsourcingOrder
// ở trên (xem comment tại đó). BE hiện chưa join warehouse/items cho endpoint chi tiết (trang chi
// tiết đọc items qua route riêng, `GET /outsourcing-orders/:id/items`). `posterBy`/`postedAt` luôn
// có giá trị — mọi phiếu đều `postedAt` ngay lúc tạo, không có trạng thái nháp.
export type OutsourcingOrderDetail = {
  id: string
  code: string
  supplier: SupplierRef
  sendDate: string
  expectedReturnDate: string | null
  status: OutsourcingOrderStatus
  totalQuantity: number
  receivedQuantity: number
  remainingQuantity: number
  note: string | null
  creatorBy: UserRef | null
  posterBy: UserRef | null
  postedAt: string | null
  createdAt: string
  updatedAt: string
}

// One row per công đoạn OUTSOURCE as-used of a Job — the create-wizard picker's source, also
// reused by ProductionJobOperationsTab.tsx to know how much a Job's own operation has already
// been sent. Mirrors `GET /outsourcing-orders/outsourceable-operations` (OutsourceableOperationResDto)
// 1:1, wire-nested — no client-side flattening needed (get-outsourceable-operations.api.ts just
// returns response.data). `job`/`bomItem`/`operation` are inlined (each used exactly once, no
// other domain reuses these exact ref shapes — same idiom as `job: {id, code} | null` in
// outbound-order.type.ts); `unit` reuses the shared `Unit` type since that ref shape repeats
// across every domain.
export type OutsourceableOperation = {
  productionJobOperationId: string // id gửi lại khi tạo phiếu
  itemId: string
  job: { id: string; code: string }
  bomItem: { code: string; name: string } // snapshot BOM của Job — không phải item gốc
  operation: {
    operationId: string | null // liên kết tham khảo tới công đoạn danh mục — null nếu mất liên kết
    code: string
    name: string
  }
  unit: Unit
  plannedQuantity: number // SL định mức (theo Job) — đóng băng lúc duyệt LSX
  sentQuantity: number // SL đã gửi (OS-OUT trước, POSTED)
  remainingQuantity: number // Còn được phép gửi = plannedQuantity − sentQuantity (BE tính SQL)
}
