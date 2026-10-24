import type { z } from "zod"

import { productionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"

// The list's filters minus status and paging: each stat tile counts the rows the list would show
// once filtered by that tile's status.
export const productionJobStatsSearchSchema = productionJobsSearchSchema.pick({
  q: true,
  clientId: true,
  itemId: true,
  dueDateFrom: true,
  dueDateTo: true,
})

export type ProductionJobStatsSearchSchema = z.infer<
  typeof productionJobStatsSearchSchema
>
