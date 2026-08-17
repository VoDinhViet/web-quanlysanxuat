import { queryOptions } from "@tanstack/react-query"

import { getOutsourcingOrder } from "@/features/outsourcing-orders/api/server-functions/get-outsourcing-order.api"

export const outsourcingOrderQueryOptions = (outsourcingOrderId: string) =>
  queryOptions({
    queryKey: ["outsourcing-orders", "detail", outsourcingOrderId],
    queryFn: () => getOutsourcingOrder({ data: { outsourcingOrderId } }),
  })
