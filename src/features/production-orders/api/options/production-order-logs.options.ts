import { queryOptions } from "@tanstack/react-query"

import { getProductionOrderLogs } from "@/features/production-orders/api/server-functions/get-production-order-logs.api"

const PRODUCTION_ORDER_LOGS_PAGE_LIMIT = 10

// The detail screen's "Lịch sử thay đổi" card — keyed by the route param like the detail query
// above, so it's read once at the page and passed down (see .claude/rules/architecture.md).
// `page` is part of the key (not a route search param — this is a secondary section on a page
// that otherwise has no pagination state of its own, so it's driven by local component state
// instead, see ProductionOrderDetailPage.tsx).
export const productionOrderLogsQueryOptions = (
  productionOrderId: string,
  page: number
) =>
  queryOptions({
    queryKey: ["production-orders", "logs", productionOrderId, page],
    queryFn: () =>
      getProductionOrderLogs({
        data: {
          productionOrderId,
          page,
          limit: PRODUCTION_ORDER_LOGS_PAGE_LIMIT,
        },
      }),
  })
