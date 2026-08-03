import { queryOptions } from "@tanstack/react-query"

import { getProductionOrders } from "@/features/production-orders/api/server-functions/get-production-orders.api"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

export const productionOrdersQueryOptions = (
  search: ProductionOrdersSearchSchema
) =>
  queryOptions({
    queryKey: ["production-orders", "list", search],
    queryFn: () => getProductionOrders({ data: search }),
  })
