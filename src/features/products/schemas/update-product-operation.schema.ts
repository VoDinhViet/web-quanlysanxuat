import { z } from "zod"

export const updateProductOperationSchema = z.object({
  sortOrder: z.number().int().min(0).optional(),
  note: z.string().trim().max(1000).optional(),
})

export type UpdateProductOperationSchema = z.infer<
  typeof updateProductOperationSchema
>
