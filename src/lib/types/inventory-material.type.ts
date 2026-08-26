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
 *  1:1 (not translated to friendlier FE names), same convention as `ProductionJobIssue`. On this
 *  screen (`itemType=RM`), `reserved`/`bomDemand` are real numbers since be-quanlysanxuat's
 *  BUG-031/032 fix: `reserved` = Σ phiếu lãnh vật tư `APPROVED` (mọi `type`); `bomDemand` = nhu cầu
 *  BOM Job đang mở chưa có phiếu lãnh **sản xuất** (`type = PRODUCTION`) nào giữ — phiếu `type =
 *  OTHER` không gắn Job nên không trừ vào đây (BE fix, xem `inventory.service.ts`'s own comments). */
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
  /** Đã giữ — Σ SL các phiếu lãnh vật tư đang APPROVED */
  reserved: number
  /** Nhu cầu BOM chưa có phiếu lãnh sản xuất (`type = PRODUCTION`) nào giữ */
  bomDemand: number
  /** Tồn khả dụng = onHand − reserved − bomDemand */
  available: number
  /** Định mức tồn tối thiểu */
  minStock: number
  status: InventoryStatus
}
