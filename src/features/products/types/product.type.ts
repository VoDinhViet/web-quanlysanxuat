// Const-tuple so the same values feed both the type and z.enum(PRODUCT_STATUSES) in
// products-search.schema.ts, instead of duplicating the literals.
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const
export type ProductStatus = (typeof PRODUCT_STATUSES)[number]

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Đang sử dụng",
  INACTIVE: "Ngừng sử dụng",
}

/**
 * Mirrors the backend's ProductResDto (GET /products, GET /products/:productId).
 * Field shape is an assumption pending backend confirmation — adjust once the real
 * endpoint contract is available.
 */
export type Product = {
  id: string
  code: string
  name: string
  imageUrl: string | null
  customerId: string | null
  customerName: string | null
  productGroupId: string | null
  productGroupName: string | null
  revision: string
  unit: string
  status: ProductStatus
  createdByName: string
  createdAt: string
}

/** Minimal option shape for the "Khách hàng" / "Nhóm sản phẩm" filter selects. */
export type ProductFilterOption = {
  id: string
  name: string
}
