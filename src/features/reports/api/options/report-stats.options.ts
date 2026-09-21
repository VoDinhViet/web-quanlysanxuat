import { queryOptions } from "@tanstack/react-query"

import { getReportStats } from "@/features/reports/api/server-functions/get-report-stats.api"

export type ReportStatsParams = {
  startDate?: string
  endDate?: string
}

export const reportStatsQueryOptions = (params: ReportStatsParams = {}) =>
  queryOptions({
    queryKey: ["reports", "stats", params],
    queryFn: () => getReportStats({ data: params }),
  })
