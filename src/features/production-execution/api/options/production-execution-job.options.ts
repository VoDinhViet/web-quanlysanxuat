import { queryOptions } from "@tanstack/react-query"

import { getProductionExecutionJob } from "@/features/production-execution/api/server-functions/get-production-execution-job.api"

export const productionExecutionJobQueryOptions = (
  productionJobId: string,
  operationId: string
) =>
  queryOptions({
    queryKey: ["production-execution", "job", productionJobId, operationId],
    queryFn: () =>
      getProductionExecutionJob({ data: { productionJobId, operationId } }),
  })
