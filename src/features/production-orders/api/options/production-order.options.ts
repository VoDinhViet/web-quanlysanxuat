import { queryOptions } from "@tanstack/react-query"

import { getProductionOrder } from "@/features/production-orders/api/server-functions/get-production-order.api"

// Keyed by the production order's own id, not the order's id (the backend detail route's lookup
// key, see production-order.type.ts).
export const productionOrderQueryOptions = (productionOrderId: string) =>
  queryOptions({
    queryKey: ["production-orders", "detail", productionOrderId],
    queryFn: () => getProductionOrder({ data: { productionOrderId } }),
  })
