import { queryOptions } from "@tanstack/react-query"

import { getOrderStats } from "@/features/orders/api/server-functions/get-order-stats.api"

export const orderStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["orders", "stats"],
    queryFn: () => getOrderStats(),
  })
