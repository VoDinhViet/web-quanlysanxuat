import { z } from "zod"

import { productProfileFields } from "@/features/products/schemas/product-form.schema"

// Wire contract for POST /api/products — same profile fields as
// productFormSchema.
export const createProductSchema = z.object(productProfileFields)

export type CreateProductSchema = z.input<typeof createProductSchema>
