import { queryOptions } from "@tanstack/react-query"

import { getJobOperationReports } from "@/features/production-execution/api/server-functions/get-job-operation-reports.api"

export const jobOperationReportsQueryOptions = (
  productionJobId: string,
  operationId?: string,
  jobOperationId?: string
) =>
  queryOptions({
    queryKey: [
      "production-execution",
      "reports",
      productionJobId,
      { operationId, jobOperationId },
    ],
    queryFn: () =>
      getJobOperationReports({
        data: { productionJobId, operationId, jobOperationId },
      }),
  })
