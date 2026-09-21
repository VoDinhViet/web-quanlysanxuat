import { queryOptions } from "@tanstack/react-query"

import { getOrderItems } from "@/features/orders/api/server-functions/get-order-items.api"

export const orderItemsQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["orders", "detail", orderId, "items"],
    queryFn: () => getOrderItems({ data: { orderId } }),
  })
