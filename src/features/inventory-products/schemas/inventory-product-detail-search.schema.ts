import { z } from "zod"

export const inventoryProductDetailSearchSchema = z.object({
  page: z.number().int().min(1).optional().catch(undefined),
  limit: z
    .union([z.literal(10), z.literal(20), z.literal(50)])
    .optional()
    .catch(undefined),
  startDate: z.string().trim().min(1).optional().catch(undefined),
  endDate: z.string().trim().min(1).optional().catch(undefined),
})

export type InventoryProductDetailSearchSchema = z.infer<
  typeof inventoryProductDetailSearchSchema
>
