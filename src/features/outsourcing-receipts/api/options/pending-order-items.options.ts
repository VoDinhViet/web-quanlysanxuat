import { queryOptions } from "@tanstack/react-query"

import { getPendingOrderItems } from "@/features/outsourcing-receipts/api/server-functions/get-pending-order-items.api"

type PendingOrderItemsParams = {
  page?: number
  limit?: number
  q?: string
  operationId?: string
}

export const pendingOrderItemsQueryOptions = (
  params: PendingOrderItemsParams
) =>
  queryOptions({
    queryKey: ["outsourcing-receipts", "pending-order-items", params],
    queryFn: () => getPendingOrderItems({ data: params }),
  })
