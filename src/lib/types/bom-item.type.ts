import type { ProductOperation } from "@/lib/types/operation.type"
import type { FileResource } from "@/lib/types/file.type"
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
// client-side, see `groupByParentId`/`flattenChildren` in ProductBomTable.tsx.
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
  image: FileResource | null
  unit: Unit | null
  quantity: number
  sortOrder: number
  // Depth from the tree top, computed by the backend — ROOT = 0, con trực tiếp = 1, …
  level: number
  note: string | null
  // A technical drawing (bản vẽ, PDF) specific to this node — independent of
  // `image` above, which is coalesced from the linked item.
  drawing: FileResource | null
  // This node's own as-used routing (GET/POST/PATCH/DELETE under
  // /api/items/:itemId/bom/items/:bomItemId/operations, via the
  // bom-operations module) — embedded directly so reading the tree doesn't
  // need a separate per-node fetch. Always empty for an CONSUMABLE leaf (routing can
  // only attach to a ROOT/COMPONENT node) and right after add/update (a freshly
  // written node has no routing yet). Field name matches the backend's
  // BomItemResDto (`operations`) 1:1 — no rename at the API boundary.
  operations: ProductOperation[]
}
