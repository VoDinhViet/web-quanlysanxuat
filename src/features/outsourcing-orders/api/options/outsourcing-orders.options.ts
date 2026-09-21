import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingOrders } from "@/features/outsourcing-orders/api/server-functions/get-outsourcing-orders.api"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OutsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"

export const outsourcingOrdersQueryOptions = (
  search: OutsourcingOrdersSearchSchema
) =>
  queryOptions<PaginatedResponse<OutsourcingOrder>>({
    queryKey: ["outsourcing-orders", "list", search],
    queryFn: () => getOutsourcingOrders({ data: search }),
  })
