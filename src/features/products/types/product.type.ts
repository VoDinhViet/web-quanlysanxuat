// Const-tuple so the same values feed both the type and z.enum(PRODUCT_STATUSES) in
// products-search.schema.ts, instead of duplicating the literals.
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang sử dụng",
  INACTIVE: "Ngừng sử dụng",
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
export type Product = {
  id: string
  code: string
  name: string
  imageUrl: string | null
  revision: string
  status: ProductStatus
  note: string | null
  unit: ProductRef
  group: ProductRef | null
  client: ProductRef | null
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

/** Aggregate counts for the list page's summary stat cards. There is no backend
 *  stats endpoint for products, so these are derived from filtered count queries
 *  (see get-product-stats.ts). */
export type ProductStats = {
  total: number
  active: number
  inactive: number
  groupCount: number
}
