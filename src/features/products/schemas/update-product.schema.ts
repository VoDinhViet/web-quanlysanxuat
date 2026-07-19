import { z } from "zod"

import { productProfileFields } from "@/features/products/schemas/create-product.schema"

// Wire contract for PATCH /api/products/:id — same profile fields as create
// (including `code`, which the backend allows changing), plus the id to route
// the request.
export const updateProductSchema = z.object({
  productId: z.uuid(),
  ...productProfileFields,
})

export type UpdateProductSchema = z.input<typeof updateProductSchema>
