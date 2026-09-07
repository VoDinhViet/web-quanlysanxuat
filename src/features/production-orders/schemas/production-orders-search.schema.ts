import { z } from "zod"

import { ProductionOrderStatus } from "@/lib/types/production-order.type"

export const productionOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionOrderStatus).optional().catch(undefined),
  dueDateFrom: z.iso.date().optional().catch(undefined),
  dueDateTo: z.iso.date().optional().catch(undefined),
})

export type ProductionOrdersSearchSchema = z.infer<
  typeof productionOrdersSearchSchema
>
