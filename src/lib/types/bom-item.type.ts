import type { ProductOperation } from "@/lib/types/operation.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

/** Mirrors the backend's ItemType for a BOM node's linked entity — a node
 *  links to either a WIP (sub-assembly, can have its own children and
 *  routing) or an RM (raw-material leaf, always childless, never has
 *  routing). The root FG/WIP item itself is never a `bom_items` row. */
export type BomItemType = "WIP" | "RM"

export const bomItemTypeLabels: Record<BomItemType, string> = {
  WIP: "Bán thành phẩm",
  RM: "Vật tư",
}

// One node — mirrors the backend's BomItemResDto 1:1, the single shape shared
// by the BOM GET (tree), and the add/update endpoints (GET/POST/PATCH under
// /api/items/:itemId/bom). The backend returns the tree flat (`parentId`
// links each node to its parent, no nested `children`) — build the tree
// client-side, see `groupByParentId`/`flattenNodes` in ProductBomTable.tsx.
export type BomItem = {
  id: string
  parentId: string | null
  // Id of the linked WIP/RM item this node points to.
  itemId: string
  itemType: BomItemType
  code: string
  name: string
  image: FileResource | null
  // Đơn vị tính — dùng type Unit chung ở @/lib/types/unit.type.
  unit: Unit
  quantity: number
  sortOrder: number
  // 1-based depth from the tree top, computed by the backend.
  level: number
  note: string | null
  // A technical drawing (bản vẽ, PDF) specific to this node — independent of
  // `image` above, which is coalesced from the linked item.
  drawing: FileResource | null
  // This node's own as-used routing (GET/POST/PATCH/DELETE under
  // /api/items/:itemId/bom/items/:bomItemId/operations, via the
  // bom-operations module) — embedded directly so reading the tree doesn't
  // need a separate per-node fetch. Always empty for an RM leaf (routing can
  // only attach to a WIP node) and right after add/update (a freshly written
  // node has no routing yet).
  operations: ProductOperation[]
}

/**
 * Trạng thái mở/đóng Modal Dialog của BOM Item:
 * - `{ mode: "closed" }`: Đóng dialog.
 * - `{ mode: "create"; parentId; itemType }`: Mở dialog thêm mới hạng mục —
 *   `itemType` đã được suy ra từ vị trí thêm (xem `resolveChildItemType` trong
 *   ProductBomTable.tsx), cây BOM đi một chiều FG → WIP → RM nên người dùng
 *   không tự chọn loại nữa.
 * - `{ mode: "update"; node: BomItem }`: Mở dialog cập nhật thông tin hạng mục.
 */
export type BomItemDialogState =
  | { mode: "closed" }
  | { mode: "create"; parentId: string | null; itemType: BomItemType }
  | { mode: "update"; node: BomItem }
