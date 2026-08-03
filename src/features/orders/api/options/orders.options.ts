import { queryOptions } from "@tanstack/react-query"

import { getOrders } from "@/features/orders/api/server-functions/get-orders.api"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

export const ordersQueryOptions = (search: OrdersSearchSchema) =>
  queryOptions({
    queryKey: ["orders", "list", search],
    queryFn: () => getOrders({ data: search }),
  })
