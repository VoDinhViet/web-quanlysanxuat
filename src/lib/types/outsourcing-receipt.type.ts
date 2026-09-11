import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"

// Re-exported so call sites can import the shared `inventory_document_status` enum straight from
// this domain's own type file, same as importing any other field here.
export { InventoryDocumentStatus }

// Reuses `InventoryDocumentStatus` from supplier-return.type.ts (shared `inventory_document_
// status` pg enum) — BE's own `OutsourcingReceiptStatus` only ever produces POSTED/CANCELLED
// (docs/decisions/outsourcing-no-draft.md phía be-quanlysanxuat), DRAFT is unreachable in
// practice but the type stays 3-value to match the shared DB enum, same as outsourcing-order.type.ts.
// Own label/description maps since the copy differs by domain ("Chờ nhận"/"Đã nhận" vs.
// "Chờ xuất"/"Đã xuất").
export const outsourcingReceiptStatusLabels: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Chờ nhận",
  [InventoryDocumentStatus.POSTED]: "Đã nhận",
  [InventoryDocumentStatus.CANCELLED]: "Đã huỷ",
}

export const outsourcingReceiptStatusDescriptions: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Phiếu chưa xác nhận nhận hàng.",
  [InventoryDocumentStatus.POSTED]: "Đã xác nhận nhận hàng.",
  [InventoryDocumentStatus.CANCELLED]: "Phiếu đã bị hủy.",
}

// Mirrors OutsourcingReceiptItemResDto (1 dòng của phiếu — mỗi dòng ứng với 1 dòng OS-OUT nguồn).
// `unit` là field riêng, không lồng trong `item` (BE tách ItemRefResDto/UnitResDto thay vì
// ItemUnitRefResDto trước đây — cùng thay đổi ở OutsourcingOrderItem, xem outsourcing-order.type.ts).
export type OutsourcingReceiptItem = {
  id: string
  outsourcingOrder: {
    id: string
    code: string
    status: InventoryDocumentStatus
    sendDate: string
  }
  item: { id: string; code: string; name: string }
  unit: Unit
  operationCode: string
  operationName: string
  quantity: number
  weight: number | null
  area: number | null
  note: string | null
}

// Mirrors PageOutsourcingReceiptResDto (GET /outsourcing-receipts, danh sách) 1:1 — riêng biệt với
// OutsourcingReceiptDetail bên dưới (không compose type này lên cái kia, cùng nguyên tắc
// OutsourcingOrder/OutsourcingOrderDetail trong outsourcing-order.type.ts): header không có
// `items[]`/`progress`/`warehouse` — dòng chi tiết phải gọi riêng GET /:id/items
// (OutsourcingReceiptItem, xem outsourcing-receipt-items.options.ts). `totalQuantity` là ngoại lệ
// — tổng hợp được về 1 số (khác `items[]`/mã OS-OUT nguồn, vốn nhiều-dòng-trên-1-phiếu không tóm
// gọn được), nên BE join sẵn cho danh sách, cùng cách PageOutsourcingOrderResDto có sẵn.
export type OutsourcingReceipt = {
  id: string
  code: string
  supplier: SupplierRef
  receiptDate: string
  requiresIqc: boolean
  status: InventoryDocumentStatus // DB status — gate nút Xác nhận đã nhận/Hủy ở trang chi tiết
  note: string | null
  creatorBy: UserRef | null
  totalQuantity: number // Σ SL nhận mọi dòng của phiếu
  createdAt: string
  updatedAt: string
}

// Mirrors OutsourcingReceiptResDto (GET /outsourcing-receipts/:id) — riêng biệt với
// OutsourcingReceipt ở trên (xem comment tại đó). `posterBy`/`postedAt` null tới khi `status` đạt
// POSTED.
export type OutsourcingReceiptDetail = {
  id: string
  code: string
  supplier: SupplierRef
  receiptDate: string
  requiresIqc: boolean
  status: InventoryDocumentStatus
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  updatedAt: string
  posterBy: UserRef | null
  postedAt: string | null
}

// One row per dòng OS-OUT, eligible cho bước ① wizard "Nhập hàng gia công về" — mirrors GET
// /outsourcing-receipts/pending-order-items (PendingOrderItemResDto) 1:1, không flatten/map thừa:
// server function (get-pending-order-items.api.ts) trả thẳng response, không transform. `id` là
// id gửi lại khi tạo dòng OS-IN (OutsourcingReceiptItemReqDto.outsourcingOrderItemId). BE trả
// `receivedQuantity` (Σ OS-IN POSTED trỏ tới dòng này) — SL còn được nhận = `quantity -
// receivedQuantity`, FE tự tính, không có field riêng. Trần thật vẫn do BE kiểm lại khi tạo phiếu
// (E172).
export type PendingOrderItem = {
  id: string
  outsourcingOrder: { id: string; code: string; sendDate: string }
  supplier: { id: string; name: string } // supplier.id dùng để tự xác định NCC của phiếu — xem PickerSection
  jobCode: string | null
  item: { code: string; name: string }
  unit: { name: string }
  operationCode: string
  operationName: string
  quantity: number // SL đã gửi của dòng OS-OUT gốc
  receivedQuantity: number // Σ SL đã nhận qua các OS-IN POSTED trỏ tới dòng này
  weight: number | null // trọng lượng gợi ý, lấy theo dòng OS-OUT gốc
  area: number | null // diện tích gợi ý, lấy theo dòng OS-OUT gốc
}
