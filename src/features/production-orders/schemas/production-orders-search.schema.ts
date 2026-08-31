import { z } from "zod"

import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import { isoDateFilter } from "@/lib/zod-transforms"

export const productionOrdersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionOrderStatus).optional().catch(undefined),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
})

export type ProductionOrdersSearchSchema = z.infer<
  typeof productionOrdersSearchSchema
>
