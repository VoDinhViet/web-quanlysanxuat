import type { FileResource } from "@/lib/types/file.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `BomType` (`bom_items.type`) — COMPONENT là node cấu trúc con: KHÔNG trỏ
 *  item, mang `code`/`name` nhập tay riêng cho vị trí này trong cây, lồng được nhiều cấp và gắn
 *  được công đoạn; CONSUMABLE là lá vật tư trỏ `items` (không con, không công đoạn). Cấp 0 (chính
 *  item FG) không có giá trị nào ở đây — không phải một dòng `bom_items`, không nằm trong response
 *  `GET .../bom` — đọc qua `itemQueryOptions`/`itemOperationsQueryOptions`
 *  (`docs/decisions/level-0-outside-bom-tree-response.md`, backend). `buildBomRows` tự dựng một
 *  dòng hiển thị riêng cho Cấp 0, không đọc field này. */
export type BomItemType = "COMPONENT" | "CONSUMABLE"

export const bomItemTypeLabels: Record<BomItemType, string> = {
  // Giữ nguyên tiếng Anh theo yêu cầu — khác quy ước "UI text tiếng Việt" chung của dự án.
  COMPONENT: "Part",
  CONSUMABLE: "Vật tư",
}

// One node — mirrors the backend's BomItemResDto 1:1, the single shape shared
// by the BOM GET (tree), and the add/update endpoints (GET/POST/PATCH under
// /api/items/:itemId/bom). The backend returns the tree flat (`parentId`
// links each node to its parent, no nested `children`), already sorted
// depth-first with `path` pre-computed (`BomsService.getBomItem` +
// `bom-tree.util.ts`) — build the display rows client-side (filter
// CONSUMABLE, format `path`), see `buildBomRows` in
// products/utils/bom-rows.util.ts.
// `parentId: null` means directly under Cấp 0 — multiple nodes may share it (a forest of
// top-level nodes, not a single root), since Cấp 0 itself never appears as a row here.
export type BomItem = {
  id: string
  parentId: string | null
  type: BomItemType
  // Vật tư node CONSUMABLE trỏ tới; null với node COMPONENT (không phải một item).
  itemId: string | null
  // COMPONENT: nhập tay trên node; CONSUMABLE: mã/tên item liên kết.
  code: string
  name: string
  // Chỉ node CONSUMABLE có (đọc từ item liên kết); null với node COMPONENT.
  revision: string | null
  // CONSUMABLE: ảnh của item liên kết; COMPONENT: ảnh riêng gán trên node (`imageFileId`, upload
  // với type BOM_ITEM_IMAGE) — null nếu chưa gán.
  image: FileResource | null
  unit: Unit | null
  quantity: number
  sortOrder: number
  // Depth tính từ Cấp 0, backend tính sẵn — con trực tiếp của Cấp 0 = 1, …
  level: number
  // Vị trí trong cây, mảng rank anh em từng cấp — con trực tiếp của Cấp 0 bắt đầu từ [1], ví dụ
  // [1,2] nghĩa là con thứ 1 của Cấp 0 rồi con thứ 2 của node đó. Backend tính sẵn
  // (BomsService.getBomItem), mảng trả về đã đúng thứ tự depth-first — FE chỉ format thành chuỗi
  // hiển thị ("0.1.2"), không tự dựng lại cây nữa.
  path: number[]
  note: string | null
  // Chuỗi công đoạn gắn trên node này, đã join sẵn trong cùng response cây (không phải gọi riêng
  // bomItemOperationsQueryOptions cho từng node) — CONSUMABLE luôn rỗng.
  operations: ProductOperation[]
}

// Mirrors the backend's BomConsumableResDto (GET .../bom/items/:bomItemId/consumables) — vật tư
// (CONSUMABLE) gắn trực tiếp vào một node cha, đọc riêng qua query phân trang/tìm kiếm được thay
// vì lọc client-side từ cây đầy đủ. `itemId` ở đây luôn có giá trị (khác `BomItem.itemId` có thể
// null) — mọi dòng trả về từ endpoint này chắc chắn là CONSUMABLE trỏ item thật.
export type BomConsumable = {
  id: string
  itemId: string
  code: string
  revision: string | null
  name: string
  image: FileResource | null
  unit: Unit | null
  quantity: number
  note: string | null
}
