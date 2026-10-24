import { queryOptions } from "@tanstack/react-query"

import { getProductionJobStats } from "@/features/production-jobs/api/server-functions/get-production-job-stats.api"
import type { ProductionJobStatsSearchSchema } from "@/features/production-jobs/schemas/production-job-stats-search.schema"

export const productionJobStatsQueryOptions = (
  filters: ProductionJobStatsSearchSchema
) =>
  queryOptions({
    queryKey: ["production-jobs", "stats", filters],
    queryFn: () => getProductionJobStats({ data: filters }),
  })
