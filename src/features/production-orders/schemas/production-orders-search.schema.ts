import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"
import { isoDateFilter } from "@/lib/zod-transforms"

export const productionOrdersSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionOrderStatus).optional().catch(undefined),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
})

export type ProductionOrdersSearchSchema = z.infer<
  typeof productionOrdersSearchSchema
>
