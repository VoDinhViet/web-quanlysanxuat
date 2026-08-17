// Domain types for Gia công ngoài — Xuất đi gia công (OS-OUT).

import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

// Re-exported so call sites can import the shared `inventory_document_status` enum straight from
// this domain's own type file, same as outsourcing-receipt.type.ts.
export { InventoryDocumentStatus }

// Khớp đúng `OutsourcingOrderProgress` bên BE (be-quanlysanxuat/src/api/outsourcing-orders/
// outsourcing-orders.constant.ts + OutsourcingOrdersService.resolveOrderProgress) — không phải
// DB `status` (chỉ DRAFT/POSTED/CANCELLED, quá thô cho UI). BE không tính "quá hạn" thành 1 giá
// trị riêng nên không có OVERDUE.
export const OutsourcingOrderStatus = {
  DRAFT: "DRAFT",
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
  [OutsourcingOrderStatus.DRAFT]: "Nháp",
  [OutsourcingOrderStatus.SENT]: "Đang gia công",
  [OutsourcingOrderStatus.PARTIAL]: "Về 1 phần",
  [OutsourcingOrderStatus.WAITING_QC]: "Chờ QC",
  [OutsourcingOrderStatus.COMPLETED]: "Hoàn thành",
  [OutsourcingOrderStatus.CANCELLED]: "Đã hủy",
}

export const outsourcingOrderStatusDescriptions: Record<
  OutsourcingOrderStatus,
  string
> = {
  [OutsourcingOrderStatus.DRAFT]: "Phiếu chưa xác nhận gửi, có thể sửa/xoá.",
  [OutsourcingOrderStatus.SENT]:
    "Đã gửi hàng, NCC đang xử lý, chưa nhận về dòng nào.",
  [OutsourcingOrderStatus.PARTIAL]: "NCC đã trả về một phần số lượng gửi.",
  [OutsourcingOrderStatus.WAITING_QC]: "Đã nhận đủ hàng, chờ IQC kiểm tra.",
  [OutsourcingOrderStatus.COMPLETED]: "Đã nhận đủ hàng và hoàn tất kiểm tra.",
  [OutsourcingOrderStatus.CANCELLED]: "Phiếu đã bị hủy.",
}

// Mirrors the list table columns (Mã phiếu/Ngày lập/Ngày gửi/NCC/Công đoạn/Tổng SL gửi/Đã
// nhận/Còn lại/Trạng thái/Ngày hẹn về). Backend's `OutsourcingOrderBaseResDto` has no
// operationName/unit/receivedQuantity at order level — a phiếu can have several dòng across
// different công đoạn/ĐVT, so the server function (get-outsourcing-orders.api.ts) gộp these from
// `items[]`: operationName joins the distinct công đoạn, receivedQuantity sums across dòng, unit
// is "--" when dòng have mixed ĐVT.
export type OutsourcingOrder = {
  id: string
  code: string // e.g. OS-OUT-0001
  createdAt: string // Ngày lập
  sentDate: string // Ngày gửi
  supplierName: string // Nhà cung cấp gia công
  operationName: string // Công đoạn
  totalQuantity: number // Tổng SL gửi
  receivedQuantity: number // Đã nhận
  unit: string
  status: OutsourcingOrderStatus
  expectedReturnDate: string | null // Ngày hẹn về — có thể chưa đặt
}

// Mirrors OutsourcingOrderItemResDto (1 dòng của phiếu — mỗi dòng 1 công đoạn/vật tư).
// plannedQuantity/sentBeforeQuantity là snapshot lúc gửi, chỉ để hiển thị/in — không dùng để
// validate lại.
export type OutsourcingOrderItem = {
  id: string
  item: { id: string; code: string; name: string; unit: Unit }
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

// Mirrors OutsourcingOrderResDto (GET /outsourcing-orders/:id). `status` là DB status thật
// (DRAFT/POSTED/CANCELLED — dùng để gate nút Xác nhận đã gửi/Hủy/Xoá ở trang chi tiết), khác
// `progress` (đã map sẵn sang OutsourcingOrderStatus, dùng cho badge hiển thị — xem
// get-outsourcing-order.api.ts).
export type OutsourcingOrderDetail = {
  id: string
  code: string
  supplier: SupplierRef
  warehouse: WarehouseRef
  sendDate: string
  expectedReturnDate: string | null
  status: InventoryDocumentStatus
  progress: OutsourcingOrderStatus
  totalQuantity: number
  items: OutsourcingOrderItem[]
  note: string | null
  creatorBy: UserRef | null
  posterBy: UserRef | null
  postedAt: string | null
  createdAt: string
  updatedAt: string
}

// One row per (Job part × công đoạn OUTSOURCE) eligible to be sent for outsourcing — the
// create-wizard picker's source. Mirrors `GET /outsourcing-orders/outsourceable-operations`
// (OutsourceableOperationResDto), flattened by the server function from the wire's nested
// `job`/`part`/`operation`/`unit` refs.
export type OutsourceableOperation = {
  id: string // productionJobOperationId — id gửi lại khi tạo phiếu
  productionJobCode: string
  itemCode: string
  itemName: string
  operationName: string
  unitName: string
  plannedQuantity: number // SL định mức (theo Job) — tính từ cây BOM
  sentQuantity: number // SL đã gửi (OS-OUT trước, DRAFT+POSTED)
  remainingQuantity: number // Còn được phép gửi = plannedQuantity − sentQuantity
}
