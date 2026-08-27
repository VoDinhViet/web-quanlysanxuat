import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Tình trạng tồn kho — backend không còn trả field này (chỉ còn dùng để lọc, `?status=`), FE tự
 *  suy từ `available`/`minStock` bằng `resolveInventoryStatus` để hiển thị. Ba ngưỡng khớp 1:1 với
 *  backend's `StockStatus` (be-quanlysanxuat/src/api/inventory/inventory.constant.ts):
 *  - NORMAL: available >= minStock (Bình thường)
 *  - WARNING: 0 <= available < minStock (Cảnh báo)
 *  - SHORTAGE: available < 0 (Thiếu) */
export type InventoryStatus = "NORMAL" | "WARNING" | "SHORTAGE"

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  NORMAL: "Bình thường",
  WARNING: "Cảnh báo",
  SHORTAGE: "Thiếu",
}

export function resolveInventoryStatus(
  available: number,
  minStock: number
): InventoryStatus {
  if (available < 0) {
    return "SHORTAGE"
  }
  if (available < minStock) {
    return "WARNING"
  }
  return "NORMAL"
}

/** Mirrors the backend's InventoryMaterialResDto (GET /api/inventory-materials) — field names
 *  match the backend 1:1 (not translated to friendlier FE names). No `type` (route is already
 *  RM-only, backend stopped sending it). `reserved` = Σ phiếu lãnh vật tư `APPROVED` (mọi `type`);
 *  `bomDemand` = nhu cầu BOM Job đang mở chưa có phiếu lãnh **sản xuất** (`type = PRODUCTION`) nào
 *  giữ — phiếu `type = OTHER` không gắn Job nên không trừ vào đây. */
export type MaterialInventoryItem = {
  id: string
  code: string
  name: string
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
}
