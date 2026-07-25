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

/** Mirrors the backend's ProductType. FINISHED_GOOD (thành phẩm) is a sellable
 *  end product and the root of its own BOM; WORK_IN_PROGRESS (bán thành phẩm) is
 *  referenced as a child node in another product's BOM tree. */
export enum ProductType {
  FINISHED_GOOD = "FINISHED_GOOD",
  WORK_IN_PROGRESS = "WORK_IN_PROGRESS",
}

/** Mirrors the backend's `source` relation (ProductRefResDto) — the product
 *  another product was cloned from. The group/unit relations use their own
 *  domain types (`ProductGroupRef` below, `Unit` from @/lib/types/unit.type)
 *  instead of this one. */
export type ProductRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's nested product-group relation (GET /api/product-groups). */
export type ProductGroupRef = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's nested creator relation (ProductCreatorResDto). */
export type ProductCreator = {
  id: string
  username: string
}

/**
 * Mirrors the backend's ProductResDto (GET /api/products, GET /api/products/:id).
 * List rows and the detail endpoint eager-load the same relations, so a row
 * already carries everything the detail drawer needs — no lazy detail fetch.
 */
/** Mirrors the backend's ProductAttachmentResDto — a join row carrying the
 *  registry file it points at. */
export type ProductAttachment = {
  id: string
  file: FileResource
}

export type Product = {
  id: string
  code: string
  name: string
  image: FileResource | null
  status: ProductStatus
  note: string | null
  unit: Unit
  group: ProductGroupRef | null
  client: ClientRef | null
  // The product this one was cloned from (POST /:id/copy); null for an
  // originally-created product.
  source: ProductRef | null
  attachments: ProductAttachment[]
  creator: ProductCreator | null
  createdAt: string
  updatedAt: string
}
