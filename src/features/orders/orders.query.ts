import { queryOptions } from "@tanstack/react-query"

import { getOrderStats } from "@/features/orders/server-functions/get-order-stats"
import { getOrders } from "@/features/orders/server-functions/get-orders"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getProducts } from "@/lib/server-functions/get-products"
import { getSalesRepOptions } from "@/lib/server-functions/get-sales-rep-options"

// Reference lists change rarely — cache them longer so moving around the module
// doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Query key convention (see .claude/rules/architecture.md): `["orders"]` is the
// feature root, so `invalidateQueries({ queryKey: ["orders"] })` after a write
// refreshes list + stats in one call.
export const ordersQueryOptions = (search: OrdersSearchSchema) =>
  queryOptions({
    queryKey: ["orders", "list", search],
    queryFn: () => getOrders({ data: search }),
  })

export const orderStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["orders", "stats"],
    queryFn: () => getOrderStats(),
  })

export const salesRepOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["orders", "sales-rep-options"],
    queryFn: () => getSalesRepOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })

export const productOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["orders", "product-options", q],
    queryFn: () =>
      getProducts({ data: { q: q || undefined, limit: FILTER_OPTIONS_LIMIT } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
