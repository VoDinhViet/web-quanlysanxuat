// Domain types for Gia công ngoài — Xuất đi gia công (OS-OUT). UI-only for now: no backend API
// exists for this domain yet, so the list page reads from static mock data (see
// src/features/outsourcing-orders/mock/) instead of a server function.

export const OutsourcingOrderStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  PARTIALLY_RETURNED: "PARTIALLY_RETURNED",
  AWAITING_QC: "AWAITING_QC",
  COMPLETED: "COMPLETED",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const

export type OutsourcingOrderStatus =
  (typeof OutsourcingOrderStatus)[keyof typeof OutsourcingOrderStatus]

export const outsourcingOrderStatusLabels: Record<
  OutsourcingOrderStatus,
  string
> = {
  [OutsourcingOrderStatus.IN_PROGRESS]: "Đang gia công",
  [OutsourcingOrderStatus.PARTIALLY_RETURNED]: "Về 1 phần",
  [OutsourcingOrderStatus.AWAITING_QC]: "Chờ QC",
  [OutsourcingOrderStatus.COMPLETED]: "Hoàn thành",
  [OutsourcingOrderStatus.OVERDUE]: "Quá hạn",
  [OutsourcingOrderStatus.CANCELLED]: "Đã hủy",
}

export const outsourcingOrderStatusDescriptions: Record<
  OutsourcingOrderStatus,
  string
> = {
  [OutsourcingOrderStatus.IN_PROGRESS]: "NCC gia công đang xử lý phiếu.",
  [OutsourcingOrderStatus.PARTIALLY_RETURNED]:
    "NCC đã trả về một phần số lượng gửi.",
  [OutsourcingOrderStatus.AWAITING_QC]: "Đã nhận đủ hàng, chờ IQC kiểm tra.",
  [OutsourcingOrderStatus.COMPLETED]: "Đã nhận đủ hàng và hoàn tất kiểm tra.",
  [OutsourcingOrderStatus.OVERDUE]: "Đã quá ngày hẹn về nhưng chưa nhận đủ.",
  [OutsourcingOrderStatus.CANCELLED]: "Phiếu đã bị hủy.",
}

// Mirrors the mockup's table columns (Mã phiếu/Ngày lập/Ngày gửi/NCC/Công đoạn/Tổng SL gửi/Đã
// nhận/Còn lại/Trạng thái/Ngày hẹn về) — `sentDate` is the one column the mockup flagged as
// missing ("Thêm cột ngày gửi"): the date the goods actually left the workshop, distinct from
// `createdAt` (when the phiếu was drafted).
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
  expectedReturnDate: string // Ngày hẹn về
}

// One row per (Job part × công đoạn OUTSOURCE) eligible to be sent for outsourcing — the
// create-wizard picker's source. Mirrors the shape of the backend's documented (not yet shipped)
// `GET /outsourcing-orders/outsourceable-operations`: `plannedQuantity` comes from the Job's BOM
// (`ProductionJobBomItem.plannedQuantity`), `sentQuantity`/`remainingQuantity` accumulate across
// every OS-OUT ever created for that operation — data no FE endpoint exposes today, so it lives
// in mock (`mock/outsourceable-operations.mock.ts`) until the real endpoint ships.
export type OutsourceableOperation = {
  id: string // productionJobOperation id
  productionJobId: string
  productionJobCode: string
  itemId: string
  itemCode: string
  itemName: string
  operationId: string
  operationCode: string
  operationName: string
  unitName: string
  plannedQuantity: number // SL định mức (theo Job)
  sentQuantity: number // Đã gửi (OS-OUT trước)
  remainingQuantity: number // Còn được phép gửi = plannedQuantity - sentQuantity
}
