import type { FileResource } from "@/lib/types/file.type"
import type { ProductOperation } from "@/lib/types/operation.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's `BomType` (`bom_items.type`) — COMPONENT là node cấu trúc con: KHÔNG trỏ
 *  item, mang `code`/`name` nhập tay riêng cho vị trí này trong cây, lồng được nhiều cấp và gắn
 *  được công đoạn; CONSUMABLE là lá vật tư trỏ `items` (không con, không công đoạn); ROOT là chính item
 *  gốc (FG) — đúng 1 dòng mỗi BOM, `parentId` luôn null (node duy nhất mang giá trị này), đọc
 *  `code`/`name`/`unit`/`image` qua join với `items` như CONSUMABLE nhưng không phải lá — nhận COMPONENT/CONSUMABLE
 *  làm con trực tiếp và gắn được công đoạn như COMPONENT (`docs/decisions/root-bom-item.md`, backend). */
export type BomItemType = "COMPONENT" | "CONSUMABLE" | "ROOT"

export const bomItemTypeLabels: Record<BomItemType, string> = {
  ROOT: "Sản phẩm gốc",
  // Giữ nguyên tiếng Anh theo yêu cầu — khác quy ước "UI text tiếng Việt" chung của dự án.
  COMPONENT: "Part",
  CONSUMABLE: "Vật tư",
}

// One node — mirrors the backend's BomItemResDto 1:1, the single shape shared
// by the BOM GET (tree), and the add/update endpoints (GET/POST/PATCH under
// /api/items/:itemId/bom). The backend returns the tree flat (`parentId`
// links each node to its parent, no nested `children`) — build the tree
// client-side, see `buildBomRows` in products/utils/bom-rows.util.ts.
// The tree always contains exactly one ROOT node (parentId: null) once the
// BOM has any data at all — an item with a still-empty BOM returns `[]`
// (ROOT itself is created lazily on the first write, see
// `docs/workflows/product-setup.md`).
export type BomItem = {
  id: string
  parentId: string | null
  type: BomItemType
  // Vật tư node CONSUMABLE trỏ tới, hoặc chính item gốc với node ROOT; null với node COMPONENT (không phải
  // một item).
  itemId: string | null
  // COMPONENT: nhập tay trên node; CONSUMABLE/ROOT: mã/tên item liên kết.
  code: string
  name: string
  // Chỉ node CONSUMABLE/ROOT có (đọc từ item liên kết); null với node COMPONENT.
  revision: string | null
  // CONSUMABLE/ROOT: ảnh của item liên kết; COMPONENT: ảnh riêng gán trên node (`imageFileId`,
  // upload với type BOM_ITEM_IMAGE) — null nếu chưa gán.
  image: FileResource | null
  unit: Unit | null
  quantity: number
  sortOrder: number
  // Depth from the tree top, computed by the backend — ROOT = 0, con trực tiếp = 1, …
  level: number
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
