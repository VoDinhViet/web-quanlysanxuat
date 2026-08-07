import type { ClientRef } from "@/lib/types/client.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Unit } from "@/lib/types/unit.type"

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "Đang sử dụng",
  [ProductStatus.INACTIVE]: "Ngừng sử dụng",
}

/** Mirrors the backend's ItemType, narrowed to the two values this feature ever
 *  sends/filters on — FG (thành phẩm) is a sellable end product and the root of
 *  its own BOM; WIP (bán thành phẩm) is referenced as a child node in another
 *  item's BOM tree. The backend's third value, RM (vật tư), is a different
 *  domain concept (see BomNodeItemType in bom-item.type.ts) and never appears
 *  on a `Product`. */
export enum ProductType {
  FG = "FG",
  WIP = "WIP",
}

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.FG]: "Thành phẩm",
  [ProductType.WIP]: "Bán thành phẩm",
}

/** Mirrors the backend's ItemRefResDto — a lightweight {id, code, name} ref,
 *  used both for the `clonedFrom` relation and by other domains' BOM/order
 *  snapshots that reference an item. */
export type ProductRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's nested creator relation (UserRefResDto). */
export type ProductCreator = {
  id: string
  code: string
  fullName: string
}

/**
 * Mirrors the backend's ItemResDto/ItemDetailResDto (GET /api/items,
 * GET /api/items/:id) narrowed to the fields this feature (FG/WIP only) reads.
 * The backend also returns a set of RM-only fields (supplier, minStock,
 * materialGrade, technicalStandard, dimensions, specificWeight, colorSurface,
 * description, origin, leadTime) that are always null/default on a FG/WIP row
 * — omitted here since this feature never reads or writes them.
 */
export type Product = {
  id: string
  code: string
  name: string
  type: ProductType
  image: FileResource | null
  status: ProductStatus
  note: string | null
  unit: Unit
  client: ClientRef | null
  // The item this one was cloned from (POST /:id/copy); null for an
  // originally-created item.
  clonedFrom: ProductRef | null
  creator: ProductCreator | null
  createdAt: string
  updatedAt: string
}
