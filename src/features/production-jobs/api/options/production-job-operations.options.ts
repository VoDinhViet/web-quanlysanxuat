import { queryOptions } from "@tanstack/react-query"

import { getProductionJobOperations } from "@/features/production-jobs/api/server-functions/get-production-job-operations.api"

// "Công đoạn sản xuất" tab (Job detail page) calls this with `operationId` omitted — every
// as-used operation of the Job, not paginated. "Thực hiện sản xuất"
// (ProductionExecutionJobPage.tsx) passes `operationId` to filter server-side to just the one
// công đoạn it cares about — the trailing key element keeps the two use cases from colliding in
// cache (see get-production-job-operations.api.ts).
export const productionJobOperationsQueryOptions = (
  productionJobId: string,
  operationId?: string
) =>
  queryOptions({
    queryKey: ["production-jobs", "operations", productionJobId, operationId],
    queryFn: () =>
      getProductionJobOperations({ data: { productionJobId, operationId } }),
  })
