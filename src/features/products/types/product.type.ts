import type { FileResource } from "@/lib/types/file.type"

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "Đang sử dụng",
  [ProductStatus.INACTIVE]: "Ngừng sử dụng",
}

/** Mirrors the backend's nested unit/group/client relation (ProductRefResDto). */
export type ProductRef = {
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
  revision: string
  status: ProductStatus
  note: string | null
  unit: ProductRef
  group: ProductRef | null
  client: ProductRef | null
  attachments: ProductAttachment[]
  creator: ProductCreator | null
  createdAt: string
  updatedAt: string
}

/** Minimal option shape for the "Khách hàng" / "Nhóm sản phẩm" / "Đơn vị tính"
 *  filter and form selects (the backend refs also carry `code`, ignored here). */
export type ProductFilterOption = {
  id: string
  name: string
}
