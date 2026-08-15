import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Tình trạng tồn kho — tính lúc đọc trên backend (không lưu cột nào), giá trị khớp
 *  1:1 với backend's `StockStatus` (be-quanlysanxuat/src/api/inventory/inventory.constant.ts).
 *  - NORMAL: available >= minStock (Bình thường)
 *  - WARNING: 0 <= available < minStock (Cảnh báo)
 *  - SHORTAGE: available < 0 (Thiếu) */
export type InventoryStatus = "NORMAL" | "WARNING" | "SHORTAGE"

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  NORMAL: "Bình thường",
  WARNING: "Cảnh báo",
  SHORTAGE: "Thiếu",
}

/** Backend's full `ItemType` (FG/WIP/RM) — wider than this app's own `ItemType`
 *  (`@/lib/types/item.type.ts`), which is narrowed to FG/WIP only for the items/BOM feature. This
 *  call fetches `itemType=RM` but the response still carries `type` for every row, so mirror the
 *  full backend enum here instead of reusing the narrowed one. */
export type InventoryItemType = "FG" | "WIP" | "RM"

/** Mirrors the backend's InventoryItemResDto (GET /api/inventory) — field names match the backend
 *  1:1 (not translated to friendlier FE names), same convention as `ProductionJobMaterial`.
 *  `bomDemand` currently always comes back `0` — the backend hasn't exploded BOM yet, see
 *  `inventory.service.ts`'s own comments. `reserved` is real (Σ đơn đã duyệt chưa giao) but this
 *  screen only ever fetches `itemType=RM`, where it's always `0` (đơn hàng chỉ trỏ FG). */
export type MaterialInventoryItem = {
  id: string
  code: string
  name: string
  type: InventoryItemType
  unit: Unit
  supplier: SupplierRef | null
  image: { url: string } | null
  /** Tồn thực tế: Σ nhập − Σ xuất trên các phiếu chưa xoá */
  onHand: number
  /** Đã giữ — luôn 0 trên màn này (chỉ khác 0 với FG có đơn mở) */
  reserved: number
  /** Tổng nhu cầu BOM: luôn 0 ở đợt này — chưa nổ BOM */
  bomDemand: number
  /** Tồn khả dụng = onHand − reserved − bomDemand */
  available: number
  /** Định mức tồn tối thiểu */
  minStock: number
  status: InventoryStatus
}
