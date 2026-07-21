import type { ProductCreator } from "@/features/products/types/product.type"

/**
 * A named version of a product. Mirrors the backend's ProductRevisionResDto
 * directly (GET /api/products/:id/revisions) — no renamed abstraction layer.
 * Only metadata is modeled today — once the structure (Tab 2) and materials
 * (Tab 3) tabs have real data, a revision will also carry the
 * structure/materials snapshot it represents. Exactly one revision has
 * `isActive: true` at a time.
 */
export type ProductRevision = {
  id: string
  revisionNo: string
  note: string | null
  isActive: boolean
  creator: ProductCreator | null
  createdAt: string
  updatedAt: string
}
