import { z } from "zod"

export const createProductOperationSchema = z.object({
  operationId: z.uuid(),
  note: z.string().trim().max(1000).optional(),
})

export type CreateProductOperationSchema = z.infer<
  typeof createProductOperationSchema
>
