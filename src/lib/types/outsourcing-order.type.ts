// Domain types for Gia công ngoài — Xuất đi gia công (OS-OUT).

import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

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

// Own label map for the raw DB status (chỉ DRAFT/POSTED/CANCELLED) — distinct copy from
// `outsourcingOrderStatusLabels` (progress), same idiom as `outsourcingReceiptStatusLabels` in
// outsourcing-receipt.type.ts. Used by the list table's Trạng thái column: `PageOutsourcingOrderResDto`
// (GET /outsourcing-orders) no longer computes `progress` — only the detail endpoint
// (GET /outsourcing-orders/:id, OutsourcingOrderDetail below) still returns it.
export const outsourcingOrderDocStatusLabels: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Nháp",
  [InventoryDocumentStatus.POSTED]: "Đã gửi",
  [InventoryDocumentStatus.CANCELLED]: "Đã huỷ",
}

export const outsourcingOrderDocStatusDescriptions: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Phiếu chưa xác nhận gửi.",
  [InventoryDocumentStatus.POSTED]: "Đã xác nhận gửi hàng.",
  [InventoryDocumentStatus.CANCELLED]: "Phiếu đã bị hủy.",
}

// Mirrors PageOutsourcingOrderResDto (GET /outsourcing-orders, danh sách) 1:1 — riêng biệt với
// OutsourcingOrderDetail bên dưới (không compose type này lên cái kia): hai endpoint khác nhau
// thật sự. BE tính totalQuantity/receivedQuantity/remainingQuantity thẳng bằng SQL subquery cho
// danh sách; endpoint chi tiết hiện không có 3 field này (cũng không có warehouse/progress/items
// — query đã bị rút gọn, xem comment tại OutsourcingOrderDetail). `status` là DB status thật
// (DRAFT/POSTED/CANCELLED), không phải business progress `OutsourcingOrderStatus` ở trên — BE
// list vẫn chưa trả progress.
export type OutsourcingOrder = {
  id: string
  code: string // e.g. OS-OUT-0001
  supplier: SupplierRef
  sendDate: string
  expectedReturnDate: string | null // có thể chưa đặt
  status: InventoryDocumentStatus
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
// ở trên (xem comment tại đó). BE hiện chưa join warehouse và chưa tính lại progress/totalQuantity/
// items cho endpoint chi tiết (query đã được rút gọn, chờ bổ sung lại) — trang chi tiết
// (OutsourcingOrderDetailHeader/ItemsCard) tự xử lý phần thiếu, không giả định các field này có
// mặt. `posterBy`/`postedAt` null tới khi `status` đạt POSTED.
export type OutsourcingOrderDetail = {
  id: string
  code: string
  supplier: SupplierRef
  sendDate: string
  expectedReturnDate: string | null
  status: InventoryDocumentStatus
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
