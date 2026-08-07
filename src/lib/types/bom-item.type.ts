import type { ProductOperation } from "@/lib/types/operation.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

/**
 * Snapshot-only now — `bom_items` (this file's `BomItem`) mirrors the
 * backend's live `ItemType` (`BomNodeItemType` below) for anything current.
 * This enum still mirrors the backend's older `BomItemType` DB enum for
 * `production-job.type.ts`, which snapshots a Job's BOM (and its itemType) at
 * approval time under the pre-items-merge names.
 */
export enum BomItemType {
  PRODUCT = "PRODUCT",
  MATERIAL = "MATERIAL",
}

export const bomItemTypeLabels: Record<BomItemType, string> = {
  [BomItemType.PRODUCT]: "Sản phẩm",
  [BomItemType.MATERIAL]: "Vật tư",
}

/** Mirrors the backend's ItemType for a BOM node's linked entity — a node
 *  links to either a WIP (sub-assembly, can have its own children and
 *  routing) or an RM (raw-material leaf, always childless, never has
 *  routing). The root FG/WIP item itself is never a `bom_items` row. */
export type BomNodeItemType = "WIP" | "RM"

export const bomNodeItemTypeLabels: Record<BomNodeItemType, string> = {
  WIP: "Bán thành phẩm",
  RM: "Vật tư",
}

// One node — mirrors the backend's BomItemResDto 1:1, the single shape shared
// by the BOM GET (tree), and the add/update endpoints (GET/POST/PATCH under
// /api/items/:itemId/bom). The backend returns the tree flat (`parentId`
// links each node to its parent, no nested `children`) — build the tree
// client-side, same idiom as ProductionJobBomTab.tsx's `buildBomRows`.
export type BomItem = {
  id: string
  parentId: string | null
  // Id of the linked WIP/RM item this node points to.
  itemId: string
  itemType: BomNodeItemType
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
 * - `{ mode: "create"; parentId: string | null }`: Mở dialog thêm mới hạng mục.
 * - `{ mode: "update"; node: BomItem }`: Mở dialog cập nhật thông tin hạng mục.
 */
export type BomItemDialogState =
  | { mode: "closed" }
  | { mode: "create"; parentId: string | null }
  | { mode: "update"; node: BomItem }

// One row of an item's BOM materials list — GET /api/items/:itemId/materials
// (ItemMaterialResDto). Read-only derived view: an RM leaf is added to the
// tree via the same create-bom-item endpoint as a WIP node (see
// BomItemFormDialog), not a separate materials CRUD.
export type BomMaterial = {
  id: string
  itemId: string
  code: string
  name: string
  unit: Unit
  image: FileResource | string | null
  quantity: number
  sortOrder: number
  note: string | null
}
