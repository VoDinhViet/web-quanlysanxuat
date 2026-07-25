import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

/**
 * One node of a product's BOM tree. Mirrors the backend's BomItemResDto /
 * BomItemNodeResDto 1:1 (GET/POST/PATCH under /api/products/:productId/bom) —
 * field names and shapes match the DTOs, no renamed abstraction layer.
 *
 * `code`/`name`/`unit`/`image` are flattened from whichever product/material
 * this node links to (see `itemType`). `children` holds this same node type —
 * the tree is nested.
 */
export enum BomItemType {
  PRODUCT = "PRODUCT",
  MATERIAL = "MATERIAL",
}

export const BOM_ITEM_TYPE_LABELS: Record<BomItemType, string> = {
  [BomItemType.PRODUCT]: "Sản phẩm",
  [BomItemType.MATERIAL]: "Vật tư",
}

// The flat node — returned by the add/update endpoints (BomItemNodeResDto).
export type BomItemNode = {
  id: string
  parentId: string | null
  itemType: BomItemType
  itemId: string
  code: string
  name: string
  image: FileResource | null
  // Đơn vị tính — dùng type Unit chung ở @/lib/types/unit.type.
  unit: Unit
  // Numeric, serialized as a string by the backend — parse at the display edge.
  quantity: string
  sortOrder: number
  note: string | null
  // A technical drawing (bản vẽ, PDF) specific to this node — independent of
  // `image` above, which is coalesced from the linked product/material.
  drawing: FileResource | null
}

// The tree node — returned by the BOM GET (BomItemResDto): a flat node plus its
// computed depth and recursive children.
export type BomItem = BomItemNode & {
  // 1-based depth from the tree top, computed by the backend.
  level: number
  children: BomItem[]
}

// Lightweight {id, code, name} row for the "add BOM item" pickers (WIP products
// / materials), narrowed from the products/materials list responses.
export type BomEntityOption = {
  id: string
  code: string
  name: string
}

// One row of a BOM's material list, aggregated per material across the whole
// tree — GET /api/products/:productId/bom/materials (BomMaterialResDto).
// `totalQuantity` is a raw sum across every MATERIAL node linking to this
// material, NOT a BOM explosion (no multiplication through a parent's own
// quantity).
export type BomMaterial = {
  materialId: string
  code: string
  name: string
  unit: Unit
  image: FileResource | null
  totalQuantity: number
}
