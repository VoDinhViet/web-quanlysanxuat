import { queryOptions } from "@tanstack/react-query"

import { ordersQueryOptions } from "@/features/orders/api"
import { getProductionOrder } from "@/features/production-orders/api/server-functions/get-production-order.api"
import { PRODUCTION_ORDER_STATUS_TO_ORDER_STATUS } from "@/lib/types/production-order.type"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

// The LSX queue is a slice of the orders list, not its own resource — this goes
// through the orders feature's barrel instead of calling GET /api/orders again,
// so the two share one cache entry: approving/rejecting an order (which
// invalidates ["orders"]) refreshes this queue for free.
export const productionOrdersQueryOptions = (
  search: ProductionOrdersSearchSchema
) =>
  ordersQueryOptions({
    page: search.page,
    limit: search.limit,
    q: search.q,
    status: PRODUCTION_ORDER_STATUS_TO_ORDER_STATUS[search.status],
    orderDateFrom: search.dueDateFrom,
    orderDateTo: search.dueDateTo,
    paymentTerm: undefined,
    salesRepId: undefined,
    order: undefined,
  })

// Genuinely `production-orders`' own resource (GET /api/production-orders/:orderId) — not a
// proxy through `orders` like the list above, so it gets its own key root.
export const productionOrderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["production-orders", "detail", orderId],
    queryFn: () => getProductionOrder({ data: { orderId } }),
  })
