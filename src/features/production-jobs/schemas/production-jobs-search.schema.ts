import { z } from "zod"

import { paginationSearchFields } from "@/lib/pagination.schema"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import { isoDateFilter } from "@/lib/zod-transforms"

// `itemId` isn't a filter on this screen's own filter bar — it's used programmatically by the
// finished-goods inventory detail screen's "LSX gần nhất" card
// (InventoryProductRecentActivityCards.tsx), via `productionJobsQueryOptions({itemId, limit: 10,
// ...})` (only the first row is used) through this feature's `api/index.ts` barrel. Backend
// prerequisite: GetProductionJobsReqDto doesn't accept `itemId` yet; proceeding on the assumption
// it lands alongside this frontend change, per the plan.
export const productionJobsSearchSchema = z.object({
  ...paginationSearchFields(),
  q: z.string().trim().min(1).optional().catch(undefined),
  status: z.enum(ProductionJobStatus).optional().catch(undefined),
  clientId: z.string().trim().min(1).optional().catch(undefined),
  itemId: z.uuid().optional().catch(undefined),
  dueDateFrom: isoDateFilter,
  dueDateTo: isoDateFilter,
})

export type ProductionJobsSearchSchema = z.infer<
  typeof productionJobsSearchSchema
>
