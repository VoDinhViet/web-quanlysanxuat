import { queryOptions } from "@tanstack/react-query"

import { getProductionJobOptions } from "@/features/production-jobs/api/server-functions/get-production-job-options.api"

// production-jobs has real screens of its own (unlike units/operations/countries), so this stays
// alongside its other queryOptions factories rather than becoming an api-only feature.
export const productionJobOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["production-jobs", "options", q],
    queryFn: () => getProductionJobOptions({ data: { q } }),
    staleTime: 5 * 60_000,
  })
