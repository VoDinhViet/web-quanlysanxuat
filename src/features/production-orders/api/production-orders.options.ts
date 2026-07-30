import { queryOptions } from "@tanstack/react-query"

import { getProductionOrderLogs } from "@/features/production-orders/api/server-functions/get-production-order-logs.api"
import { getProductionOrder } from "@/features/production-orders/api/server-functions/get-production-order.api"
import { getProductionOrders } from "@/features/production-orders/api/server-functions/get-production-orders.api"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

// Query key convention (see .claude/rules/architecture.md): `["production-orders"]` is the
// feature root, so `invalidateQueries({ queryKey: ["production-orders"] })` refreshes list +
// detail in one call.
export const productionOrdersQueryOptions = (
  search: ProductionOrdersSearchSchema
) =>
  queryOptions({
    queryKey: ["production-orders", "list", search],
    queryFn: () => getProductionOrders({ data: search }),
  })

// Keyed by the production order's own id, not the order's id (the backend detail route's lookup
// key, see production-order.type.ts).
export const productionOrderQueryOptions = (productionOrderId: string) =>
  queryOptions({
    queryKey: ["production-orders", "detail", productionOrderId],
    queryFn: () => getProductionOrder({ data: { productionOrderId } }),
  })

export const PRODUCTION_ORDER_LOGS_PAGE_LIMIT = 10

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
