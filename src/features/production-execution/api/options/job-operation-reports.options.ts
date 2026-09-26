import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { getJobOperationReports } from "@/features/production-execution/api/server-functions/get-job-operation-reports.api"

type JobOperationReportsParams = {
  productionJobId: string
  operationId?: string
  jobOperationId?: string
  bomItemId?: string
  page: number
  limit: number
}

export const jobOperationReportsQueryOptions = (
  params: JobOperationReportsParams
) =>
  queryOptions({
    queryKey: ["production-execution", "reports", params],
    queryFn: () => getJobOperationReports({ data: params }),
    placeholderData: keepPreviousData,
  })
