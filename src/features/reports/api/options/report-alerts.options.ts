import { queryOptions } from "@tanstack/react-query"

import { getReportAlerts } from "@/features/reports/api/server-functions/get-report-alerts.api"

export const reportAlertsQueryOptions = () =>
  queryOptions({
    queryKey: ["reports", "alerts"],
    queryFn: () => getReportAlerts(),
  })
