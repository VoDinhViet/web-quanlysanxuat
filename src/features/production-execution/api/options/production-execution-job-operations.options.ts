import { queryOptions } from "@tanstack/react-query"

import { getProductionExecutionJobOperations } from "@/features/production-execution/api/server-functions/get-production-execution-job-operations.api"

export const productionExecutionJobOperationsQueryOptions = (
  productionJobId: string,
  operationId: string
) =>
  queryOptions({
    queryKey: [
      "production-execution",
      "job-operations",
      productionJobId,
      operationId,
    ],
    queryFn: () =>
      getProductionExecutionJobOperations({
        data: { productionJobId, operationId },
      }),
  })
