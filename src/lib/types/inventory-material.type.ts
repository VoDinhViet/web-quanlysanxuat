/** Tình trạng tồn kho vật tư */
export enum InventoryStatus {
  /** Bình thường: Tồn khả dụng >= Min */
  NORMAL = "NORMAL",
  /** Cảnh báo: 0 <= Tồn khả dụng < Min */
  WARNING = "WARNING",
  /** Thiếu: Tồn khả dụng < 0 */
  SHORTAGE = "SHORTAGE",
}

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  [InventoryStatus.NORMAL]: "Bình thường",
  [InventoryStatus.WARNING]: "Cảnh báo",
  [InventoryStatus.SHORTAGE]: "Thiếu",
}

/** Mirrors the backend's InventoryMaterialResDto (GET /api/inventory/materials). */
export type InventoryMaterial = {
  id: string
  code: string
  name: string
  unit: { id: string; name: string }
  group: { id: string; name: string }
  image: { url: string } | null
  /** Tồn thực tế: Số lượng vật tư hiện có trong kho tại thời điểm xem tồn */
  stockActual: number
  /** Đã giữ: Số lượng đã được duyệt nhưng chưa xuất kho */
  stockHeld: number
  /** Có thể xuất: Số lượng hàng có thể xuất kho = Tồn thực tế - Đã giữ */
  stockAvailable: number
  /** Tổng nhu cầu BOM: Tổng nhu cầu của các LSX/Job chưa hoàn thành */
  demandBom: number
  /** Tồn khả dụng: Tồn thực tế - Tổng nhu cầu BOM */
  stockUsable: number
  /** Min: Định mức tồn kho tối thiểu */
  minStock: number
  status: InventoryStatus
}
