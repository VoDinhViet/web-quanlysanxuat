/** Mirrors the backend's ReportStatsResDto (GET /api/reports/stats). All `*TrendCount`/
 *  `*TrendPercent`/`upcomingDueWindowDays` fields are null when a startDate/endDate filter is
 *  applied — comparing against "yesterday"/"last week" stops making sense for a picked range. */
export type ReportStats = {
  runningOrders: number
  runningOrdersTrendPercent: number | null
  overdueOrders: number
  overdueOrdersTrendCount: number | null
  upcomingDueOrders: number
  upcomingDueWindowDays: number | null
  runningJobs: number
  runningJobsTrendCount: number | null
  jobsWaitingQc: number
  jobsWaitingQcTrendCount: number | null
  openNcr: number
  openNcrTrendCount: number | null
}
