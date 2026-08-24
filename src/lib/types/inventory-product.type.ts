import type { SupplierRef } from "@/lib/types/supplier.type"
import type { Unit } from "@/lib/types/unit.type"

/** Tình trạng tồn kho — tính lúc đọc trên backend (không lưu cột nào), giá trị khớp
 *  1:1 với backend's `StockStatus` (be-quanlysanxuat/src/api/inventory/inventory.constant.ts).
 *  - NORMAL: available >= minStock (Bình thường)
 *  - WARNING: 0 <= available < minStock (Cảnh báo)
 *  - SHORTAGE: available < 0 (Thiếu)
 *  `minStock` luôn 0 với FG (khái niệm của RM) nên WARNING không bao giờ xảy ra ở màn này — chỉ
 *  còn NORMAL/SHORTAGE trên thực tế. Local twin của `InventoryStatus`
 *  (`@/lib/types/inventory-material.type.ts`) — không import chéo feature, xem comment "Local
 *  twin..." trong `InventoryMaterialsTableCells.tsx`. */
export type InventoryStatus = "NORMAL" | "WARNING" | "SHORTAGE"

/** Backend's full `ItemType` (FG/WIP/RM) — wider than this app's own `ItemType`
 *  (`@/lib/types/item.type.ts`), which is narrowed to FG/WIP only for the items/BOM feature. This
 *  call fetches `itemType=FG` but the response still carries `type` for every row, so mirror the
 *  full backend enum here instead of reusing the narrowed one. */
export type InventoryItemType = "FG" | "WIP" | "RM"

/** Mirrors the backend's InventoryItemResDto (GET /api/inventory?itemType=FG) — field names match
 *  the backend 1:1 (not translated to friendlier FE names), same convention as
 *  `MaterialInventoryItem` (`@/lib/types/inventory-material.type.ts`), its RM-side twin — kept
 *  separate rather than shared/imported, per this repo's established convention for this feature
 *  pair. `bomDemand` currently always comes back `0` — the backend hasn't exploded BOM yet, so
 *  `available === onHand − reserved` on every row until it does. */
export type ProductInventoryItem = {
  id: string
  code: string
  name: string
  type: InventoryItemType
  unit: Unit
  /** NCC chỉ có ý nghĩa với RM — luôn null trên FG. Giữ vì DTO trả về; không cột nào hiển thị. */
  supplier: SupplierRef | null
  image: { url: string } | null
  /** Tồn thực tế: Σ nhập − Σ xuất trên các phiếu chưa xoá */
  onHand: number
  /** Đã giữ: Σ SL đơn hàng đã duyệt còn mở, trừ phần đã xuất giao. Thật và khác 0 với FG — khác
   *  `MaterialInventoryItem.reserved`, luôn 0 với RM (đơn hàng chỉ trỏ FG). */
  reserved: number
  /** Tổng nhu cầu BOM: luôn 0 ở đợt này — chưa nổ BOM */
  bomDemand: number
  /** Tồn khả dụng = onHand − reserved − bomDemand */
  available: number
  /** Định mức tồn tối thiểu — khái niệm của RM, luôn 0 với FG. Không cột nào hiển thị. */
  minStock: number
  status: InventoryStatus
}
