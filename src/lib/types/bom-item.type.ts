import type { ProductOperation } from "@/lib/types/operation.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

/**
 * Snapshot-only now — `bom_items` (this file's `BomItem`) split its material
 * rows into their own `bom_materials` table/endpoint, so every current BOM
 * structure node is a WIP product (see `BomItem.productId`). The enum still
 * mirrors the backend's `BomItemType` DB enum for `production-job.type.ts`,
 * which snapshots a Job's BOM (and its itemType) at approval time.
 */
export enum BomItemType {
  PRODUCT = "PRODUCT",
  MATERIAL = "MATERIAL",
}

export const BOM_ITEM_TYPE_LABELS: Record<BomItemType, string> = {
  [BomItemType.PRODUCT]: "Sản phẩm",
  [BomItemType.MATERIAL]: "Vật tư",
}

// One node — mirrors the backend's BomItemResDto 1:1, the single shape shared
// by the BOM GET (tree), and the add/update endpoints (GET/POST/PATCH under
// /api/products/:productId/bom). The backend returns the tree flat (`parentId`
// links each node to its parent, no nested `children`) — build the tree
// client-side, same idiom as ProductionJobBomTab.tsx's `buildBomRows`.
export type BomItem = {
  id: string
  parentId: string | null
  // Id of the linked WIP product — every node is now a WIP product (materials
  // were split into their own bom_materials table/endpoint).
  productId: string
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
  // `image` above, which is coalesced from the linked product.
  drawing: FileResource | null
  // This node's own as-used routing (GET/POST/PATCH/DELETE under
  // /api/products/:productId/bom/items/:itemId/operations, via the
  // bom-operations module) — embedded directly so reading the tree doesn't
  // need a separate per-node fetch. Empty right after add/update (a freshly
  // written node has no routing yet).
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

// Lightweight {id, code, name} row for the "add BOM item" pickers (WIP products
// / materials), narrowed from the products/materials list responses.
export type BomEntityOption = {
  id: string
  code: string
  name: string
}

// One row of a product's BOM materials list — GET /api/products/:productId/materials (BomMaterialResDto).
export type BomMaterial = {
  id: string
  materialId: string
  code: string
  name: string
  unit: Unit
  image: FileResource | string | null
  quantity: number
  sortOrder: number
  note: string | null
}
