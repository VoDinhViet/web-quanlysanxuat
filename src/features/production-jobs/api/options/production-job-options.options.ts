import { queryOptions } from "@tanstack/react-query"

import { getProductionJobOptions } from "@/features/production-jobs/api/server-functions/get-production-job-options.api"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"

// production-jobs has real screens of its own (unlike units/operations/countries), so this stays
// alongside its other queryOptions factories rather than becoming an api-only feature. `status` is
// part of the key — two pickers with different status filters must not share a cache entry.
export const productionJobOptionsQueryOptions = (
  q: string,
  status?: ProductionJobStatus
) =>
  queryOptions({
    queryKey: ["production-jobs", "options", q, status],
    queryFn: () => getProductionJobOptions({ data: { q, status } }),
    staleTime: 5 * 60_000,
  })
