import { queryOptions } from "@tanstack/react-query"

import { getProductionJob } from "@/features/production-jobs/api/server-functions/get-production-job.api"

export const productionJobQueryOptions = (jobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "detail", jobId],
    queryFn: () => getProductionJob({ data: { jobId } }),
  })
