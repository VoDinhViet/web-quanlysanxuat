import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's InventoryProductResDto (GET /api/inventory-products) — field names match
 *  the backend 1:1 (not translated to friendlier FE names). No `type`/`supplier`/`minStock`
 *  (RM-only concepts, backend never sends them here) and no `status` — the backend deliberately
 *  doesn't classify tồn kho status on this response; nothing in this feature reads it today (FG's
 *  `minStock` is always 0, so a shortage/normal read is just `available < 0`, computable from
 *  `available` alone if a screen ever needs it). */
export type ProductInventoryItem = {
  id: string
  code: string
  name: string
  unit: Unit
  image: { url: string } | null
  /** Tồn thực tế: Σ nhập − Σ xuất trên các phiếu chưa xoá */
  onHand: number
  /** Đã giữ — Σ SL lệnh xuất hàng (DO) đang PENDING_APPROVAL/PENDING_DELIVERY. Khác
   *  `MaterialInventoryItem.reserved` (RM: Σ phiếu lãnh vật tư APPROVED) — nguồn chứng từ khác nhau. */
  reserved: number
  /** Nhu cầu đơn hàng mở chưa có DO nào giữ */
  bomDemand: number
  /** Tồn khả dụng = onHand − reserved − bomDemand */
  available: number
}
