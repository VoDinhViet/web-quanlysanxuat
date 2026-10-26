import { queryOptions } from "@tanstack/react-query"

import { getOutboundOrderStats } from "@/features/outbound-orders/api/server-functions/get-outbound-order-stats.api"
import type { OutboundOrderStatsSearchSchema } from "@/features/outbound-orders/schemas/outbound-order-stats-search.schema"

export const outboundOrderStatsQueryOptions = (
  filters: OutboundOrderStatsSearchSchema
) =>
  queryOptions({
    queryKey: ["outbound-orders", "stats", filters],
    queryFn: () => getOutboundOrderStats({ data: filters }),
  })
