import { z } from "zod"

import { OperationType } from "@/lib/types/operation.type"

export const createProductOperationSchema = z.object({
  operationId: z.uuid(),
  type: z.enum(OperationType),
  note: z.string().trim().max(1000).optional(),
})

export type CreateProductOperationSchema = z.infer<
  typeof createProductOperationSchema
>
