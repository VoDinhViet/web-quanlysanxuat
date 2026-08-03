import { queryOptions } from "@tanstack/react-query"

import { getOrder } from "@/features/orders/api/server-functions/get-order.api"

export const orderQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => getOrder({ data: { orderId } }),
  })
