import { queryOptions } from "@tanstack/react-query"

import { getOrderPayments } from "@/features/orders/api/server-functions/get-order-payments.api"

export const orderPaymentsQueryOptions = (orderId: string) =>
  queryOptions({
    queryKey: ["orders", "detail", orderId, "payments"],
    queryFn: () => getOrderPayments({ data: { orderId } }),
  })
