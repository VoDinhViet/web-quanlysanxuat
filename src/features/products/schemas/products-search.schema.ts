import { z } from "zod"

import { ProductStatus } from "@/features/products/types/product.type"
import { SORT_ORDERS } from "@/lib/types/pagination.type"

// Mirrors the backend's GetProductsReqDto (page, limit, q, order inherited from
// PageOptionsDto; status/clientId/productGroupId are product-specific filters).
export const productsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductStatus).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  productGroupId: z.string().trim().min(1).optional().catch(undefined),
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
})

export type ProductsSearchSchema = z.infer<typeof productsSearchSchema>
