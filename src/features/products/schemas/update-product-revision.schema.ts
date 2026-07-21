import { createProductRevisionSchema } from "@/features/products/schemas/create-product-revision.schema"
import type { z } from "zod"

// Editing an existing revision only touches its code and note — sourceRevisionId
// and setAsCurrent are creation/activation-only concerns, so this reuses the
// two matching field validators from create rather than duplicating them.
export const updateProductRevisionSchema = createProductRevisionSchema.pick({
  revisionNo: true,
  note: true,
})

export type UpdateProductRevisionSchema = z.infer<
  typeof updateProductRevisionSchema
>
