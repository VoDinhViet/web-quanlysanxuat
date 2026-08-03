import { queryOptions } from "@tanstack/react-query"

import { getProductionJobs } from "@/features/production-jobs/api/server-functions/get-production-jobs.api"
import type { ProductionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"

export const productionJobsQueryOptions = (
  search: ProductionJobsSearchSchema
) =>
  queryOptions({
    queryKey: ["production-jobs", "list", search],
    queryFn: () => getProductionJobs({ data: search }),
  })
