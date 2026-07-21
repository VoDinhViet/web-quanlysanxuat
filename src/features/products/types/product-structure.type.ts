export enum StructureNodeType {
  ASSEMBLY = "ASSEMBLY",
  PART = "PART",
  MATERIAL = "MATERIAL",
}

export const STRUCTURE_NODE_TYPE_LABELS: Record<StructureNodeType, string> = {
  [StructureNodeType.ASSEMBLY]: "Cụm",
  [StructureNodeType.PART]: "Chi tiết",
  [StructureNodeType.MATERIAL]: "Vật tư",
}

export enum OperationType {
  IN_HOUSE = "IN_HOUSE",
  OUTSOURCED = "OUTSOURCED",
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  [OperationType.IN_HOUSE]: "Nội bộ",
  [OperationType.OUTSOURCED]: "Gia công ngoài",
}

/** A manufacturing step attached to a structure node (assembly or part —
 *  purchased-material nodes carry none). `sequence` is derived, not user-set:
 *  it's the node's operations in array order, renumbered on every add/remove. */
export type ProductOperation = {
  id: string
  sequence: number
  name: string
  resource: string
  type: OperationType
  minutes: number
  note: string
}

/**
 * One node of the product's multi-level BOM tree. The product itself is an
 * implicit root — `ProductStructureTab` renders `children` of that root as
 * the top-level list. `material` names what a PART is machined from (e.g.
 * "Thép C45"); it's meaningless for ASSEMBLY/MATERIAL nodes and left "".
 */
export type ProductStructureNode = {
  id: string
  code: string
  name: string
  type: StructureNodeType
  quantity: number
  unit: string
  material: string
  // No upload flow yet (mock-only tab, see the note on PRODUCT_DETAIL_TABS in
  // product-detail-search.schema.ts) — always null today, rendered as a
  // placeholder thumbnail until a real image field lands.
  imageUrl: string | null
  operations: ProductOperation[]
  children: ProductStructureNode[]
}
