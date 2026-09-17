import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

export enum ItemStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const itemStatusLabels: Record<ItemStatus, string> = {
  [ItemStatus.ACTIVE]: "Đang sử dụng",
  [ItemStatus.INACTIVE]: "Ngừng sử dụng",
}

/** Mirrors the backend's ItemType, narrowed to the one value this feature ever
 *  sends/filters on — FG (thành phẩm) is a sellable end product and the root of
 *  its own BOM. The backend's other value, CONSUMABLE (vật tư), is a different domain
 *  concept (consumables feature) and never appears on an `Item`. Node cấu trúc
 *  con không còn là item (xem `BomItemType` in bom-item.type.ts). Giữ dạng
 *  enum 1 giá trị để không vỡ mọi import. */
export enum ItemType {
  FG = "FG",
}

export const itemTypeLabels: Record<ItemType, string> = {
  [ItemType.FG]: "Thành phẩm",
}

/** Mirrors the backend's ItemRefResDto — a lightweight {id, code, name} ref,
 *  used both for the `clonedFrom` relation and by other domains' BOM/order
 *  snapshots that reference an item. */
export type ItemRef = {
  id: string
  code: string
  revision: string
  name: string
}

/** Mirrors the backend's nested creator relation (UserRefResDto). */
export type ItemCreator = {
  id: string
  code: string
  fullName: string
}

/** Mirrors the backend's ItemFileResDto — one row of the item's attached-documents
 *  list (item_files), distinct from the single `image` field. */
export type ItemFile = {
  id: string
  file: FileResource
}

/**
 * Mirrors the backend's ItemResDto/ItemDetailResDto (GET /api/items,
 * GET /api/items/:id) narrowed to the fields this feature (FG only) reads.
 * The backend also returns a set of CONSUMABLE-only fields (supplier, minStock,
 * consumableGrade, technicalStandard, dimensions, specificWeight, colorSurface,
 * description, origin, leadTime) that are always null/default on a FG row
 * — omitted here since this feature never reads or writes them.
 */
export type Item = {
  id: string
  code: string
  revision: string
  name: string
  type: ItemType
  image: FileResource | null
  status: ItemStatus
  note: string | null
  unit: Unit
  client: ClientRef | null
  // The item this one was cloned from (POST /:id/copy); null for an
  // originally-created item.
  clonedFrom: ItemRef | null
  creator: ItemCreator | null
  files: ItemFile[]
  createdAt: string
  updatedAt: string
}

// Mirrors the backend's ItemIssueResDto (GET /api/items/:itemId/issues,
// paginated, `q` filters code/name) — "Thành phần vật tư" tab: every CONSUMABLE
// this item's BOM tree consumes, one row per consumable (grouped by
// `itemId`, not per `bom_items` node — the same consumable can appear under
// several parent nodes in the tree, so this list has no
// `id`/`sortOrder`/`note`, those are per-node, not per-consumable; see
// BomItem in bom-item.type.ts for the raw per-node tree instead).
//
// `requiredQty` is the exploded amount for 1 unit of the root item —
// multiplied cumulatively through every ancestor COMPONENT node's own quantity,
// then summed across all occurrences of that consumable. Same field name as
// the production-job consumable demand (`ProductionJobIssue.requiredQty`,
// see production-job.type.ts) — same concept, different seed (1 unit of
// the root item here vs. the Job quantity there). Named `*Issue` to match
// that Job-side concept, not the unrelated `Consumable` type (consumable.type.ts,
// the CONSUMABLE master-data shape) or `inventory-issues` (real stock-issue
// documents) — deliberate, not a typo.
export type ItemIssue = {
  itemId: string
  code: string
  name: string
  unit: Unit
  image: FileResource | string | null
  requiredQty: number
}
