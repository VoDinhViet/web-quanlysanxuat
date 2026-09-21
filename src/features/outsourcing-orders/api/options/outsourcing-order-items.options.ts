import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingOrderItems } from "@/features/outsourcing-orders/api/server-functions/get-outsourcing-order-items.api"

export const outsourcingOrderItemsQueryOptions = (outsourcingOrderId: string) =>
  queryOptions({
    queryKey: ["outsourcing-orders", "detail", outsourcingOrderId, "items"],
    queryFn: () => getOutsourcingOrderItems({ data: { outsourcingOrderId } }),
  })
