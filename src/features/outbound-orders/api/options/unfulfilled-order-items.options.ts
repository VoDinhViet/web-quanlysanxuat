import { queryOptions } from "@tanstack/react-query"

import { getUnfulfilledOrderItems } from "@/features/outbound-orders/api/server-functions/get-unfulfilled-order-items.api"

type UnfulfilledOrderItemsParams = {
  page?: number
  limit?: number
  clientId?: string
  excludeOutboundOrderId?: string
}

export const unfulfilledOrderItemsQueryOptions = (
  params: UnfulfilledOrderItemsParams
) =>
  queryOptions({
    queryKey: ["outbound-orders", "unfulfilled-order-items", params],
    queryFn: () => getUnfulfilledOrderItems({ data: params }),
  })
