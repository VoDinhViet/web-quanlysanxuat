import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Tình trạng tồn kho vật tư — tính lúc đọc trên backend (không lưu cột nào), giá trị khớp
 *  1:1 với backend's `MaterialStockStatus` (be-quanlysanxuat/src/api/inventory/inventory.constant.ts).
 *  - NORMAL: available >= minStock (Bình thường)
 *  - WARNING: 0 <= available < minStock (Cảnh báo)
 *  - SHORTAGE: available < 0 (Thiếu) */
export type InventoryStatus = "NORMAL" | "WARNING" | "SHORTAGE"

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  NORMAL: "Bình thường",
  WARNING: "Cảnh báo",
  SHORTAGE: "Thiếu",
}

/** Mirrors the backend's MaterialInventoryItemResDto (GET /api/inventory/materials) — field
 *  names match the backend 1:1 (not translated to friendlier FE names), same convention as
 *  `ProductionJobMaterial`. `reserved`/`bomDemand` currently always come back `0` — the backend
 *  doesn't have "Phiếu lãnh vật tư" (material requisitions) or BOM explosion yet, see
 *  `inventory.service.ts`'s own comments. */
export type MaterialInventoryItem = {
  id: string
  code: string
  name: string
  unit: Unit
  supplier: SupplierRef | null
  image: { url: string } | null
  /** Tồn thực tế: Σ nhập − Σ xuất trên các phiếu chưa xoá */
  onHand: number
  /** Đã giữ: luôn 0 ở đợt này — chưa có Phiếu lãnh vật tư */
  reserved: number
  /** Có thể xuất = onHand − reserved */
  issuable: number
  /** Tổng nhu cầu BOM: luôn 0 ở đợt này — chưa nổ BOM */
  bomDemand: number
  /** Tồn khả dụng = onHand − bomDemand */
  available: number
  /** Định mức tồn tối thiểu */
  minStock: number
  status: InventoryStatus
}
