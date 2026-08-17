import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"
import type { UserRef } from "@/lib/types/user.type"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

// Re-exported so call sites can import the shared `inventory_document_status` enum straight from
// this domain's own type file, same as importing any other field here.
export { InventoryDocumentStatus }

// Reuses `InventoryDocumentStatus` from supplier-return.type.ts (shared `inventory_document_
// status` pg enum) — only DRAFT/POSTED/CANCELLED are ever produced here, same subset supplier
// returns use. Own label map since the copy differs by domain ("Chờ nhận"/"Đã nhận" vs.
// "Chờ xuất"/"Đã xuất").
export const outsourcingReceiptStatusLabels: Record<
  InventoryDocumentStatus,
  string
> = {
  [InventoryDocumentStatus.DRAFT]: "Chờ nhận",
  [InventoryDocumentStatus.POSTED]: "Đã nhận",
  [InventoryDocumentStatus.CANCELLED]: "Đã huỷ",
}

// Khớp đúng `OutsourcingReceiptProgress` bên BE (be-quanlysanxuat/src/api/outsourcing-receipts/
// outsourcing-receipts.constant.ts) — không phải DB `status` (chỉ DRAFT/POSTED/CANCELLED, quá thô
// cho UI). Cùng idiom OutsourcingOrderStatus trong outsourcing-order.type.ts, khác ở chỗ không có
// SENT (OS-IN không có bước "đã gửi chờ NCC xử lý" như OS-OUT).
export const OutsourcingReceiptProgress = {
  DRAFT: "DRAFT",
  PARTIAL: "PARTIAL",
  WAITING_QC: "WAITING_QC",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export type OutsourcingReceiptProgress =
  (typeof OutsourcingReceiptProgress)[keyof typeof OutsourcingReceiptProgress]

export const outsourcingReceiptProgressLabels: Record<
  OutsourcingReceiptProgress,
  string
> = {
  [OutsourcingReceiptProgress.DRAFT]: "Nháp",
  [OutsourcingReceiptProgress.PARTIAL]: "Về 1 phần",
  [OutsourcingReceiptProgress.WAITING_QC]: "Chờ QC",
  [OutsourcingReceiptProgress.COMPLETED]: "Hoàn thành",
  [OutsourcingReceiptProgress.CANCELLED]: "Đã hủy",
}

export const outsourcingReceiptProgressDescriptions: Record<
  OutsourcingReceiptProgress,
  string
> = {
  [OutsourcingReceiptProgress.DRAFT]:
    "Phiếu chưa xác nhận nhận, có thể sửa/xoá.",
  [OutsourcingReceiptProgress.PARTIAL]:
    "Đã nhận nhưng còn dòng OS-OUT nguồn chưa nhận đủ.",
  [OutsourcingReceiptProgress.WAITING_QC]: "Đã nhận đủ hàng, chờ IQC kiểm tra.",
  [OutsourcingReceiptProgress.COMPLETED]:
    "Mọi dòng OS-OUT nguồn liên quan đã nhận đủ.",
  [OutsourcingReceiptProgress.CANCELLED]: "Phiếu đã bị hủy.",
}

// Mirrors OutsourcingReceiptItemResDto (1 dòng của phiếu — mỗi dòng ứng với 1 dòng OS-OUT nguồn).
export type OutsourcingReceiptItem = {
  id: string
  outsourcingOrder: {
    id: string
    code: string
    status: InventoryDocumentStatus
    sendDate: string
  }
  item: { id: string; code: string; name: string; unit: Unit }
  operationCode: string
  operationName: string
  quantity: number
  weight: number | null
  area: number | null
  note: string | null
}

// Mirrors OutsourcingReceiptBaseResDto (GET /outsourcing-receipts, danh sách) — dùng chung làm
// nền cho cả OutsourcingReceiptDetail bên dưới, không có bản "flattened" riêng cho danh sách: một
// phiếu có thể gộp nhiều dòng OS-OUT khác nhau (khác NCC nào cũng chặn ở BE — E187 — nhưng khác
// OS-OUT thì được), nên `items[]` giữ nguyên, việc gộp hiển thị (nối tên vật tư, gộp mã OS-OUT...)
// là việc của OutsourcingReceiptsTableColumns.tsx, không map/tổng hợp sẵn ở tầng type/server
// function (tránh dữ liệu thừa — xem get-outsourcing-receipts.api.ts).
export type OutsourcingReceipt = {
  id: string
  code: string
  supplier: SupplierRef
  warehouse: WarehouseRef
  receiptDate: string
  requiresIqc: boolean
  status: InventoryDocumentStatus // DB status — gate nút Xác nhận đã nhận/Hủy ở trang chi tiết
  progress: OutsourcingReceiptProgress // dùng cho badge hiển thị
  totalQuantity: number // BE đã tính sẵn (tổng SL nhận mọi dòng)
  items: OutsourcingReceiptItem[]
  note: string | null
  creatorBy: UserRef | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the backend's OutsourcingReceiptResDto (GET /api/outsourcing-receipts/:id) — adds
 *  `posterBy`/`postedAt` over the list row, both null until `status` reaches `POSTED`. */
export type OutsourcingReceiptDetail = OutsourcingReceipt & {
  posterBy: UserRef | null
  postedAt: string | null
}

// One row per dòng OS-OUT, eligible cho bước ① wizard "Nhập hàng gia công về" — mirrors GET
// /outsourcing-receipts/pending-order-items (PendingOrderItemResDto), flattened bởi server
// function (get-pending-order-items.api.ts) từ wire's nested outsourcingOrder/supplier/
// productionJob/item refs, cùng idiom OutsourceableOperation ở outsourcing-order.type.ts (1 dòng
// wire = 1 dòng FE nên flatten hợp lý, khác OutsourcingReceipt ở trên). BE chưa trả SL đã
// nhận/còn lại ở endpoint này (chỉ trả `quantity` — SL đã gửi của dòng OS-OUT gốc) — giới hạn
// thật (không vượt SL còn lại sau các lần nhận trước) được BE kiểm khi tạo phiếu (E172).
export type PendingOrderItem = {
  outsourcingOrderItemId: string // id gửi lại khi tạo dòng OS-IN (BE trả field `id`)
  outsourcingOrderId: string
  outsourcingOrderCode: string
  sendDate: string
  supplierId: string // dùng để tự xác định NCC của phiếu theo dòng đã chọn — xem PickerSection
  supplierName: string
  productionJobCode: string | null
  itemCode: string
  itemName: string
  unitName: string
  operationCode: string
  operationName: string
  // Đổi tên từ `quantity` (BE) — tránh trùng tên với field "SL nhận lần này" người dùng tự nhập ở
  // bước ②, vốn cũng gọi là `quantity` trong CreateOutsourcingReceiptItemValue.
  sentQuantity: number
  weight: number | null // trọng lượng gợi ý, lấy theo dòng OS-OUT gốc
  area: number | null // diện tích gợi ý, lấy theo dòng OS-OUT gốc
}
