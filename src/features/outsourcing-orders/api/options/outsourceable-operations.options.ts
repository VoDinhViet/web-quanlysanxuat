import { queryOptions } from "@tanstack/react-query"

import { getOutsourceableOperations } from "@/features/outsourcing-orders/api/server-functions/get-outsourceable-operations.api"

type OutsourceableOperationsParams = {
  page?: number
  limit?: number
  q?: string
  productionJobId?: string
  operationId?: string
}

export const outsourceableOperationsQueryOptions = (
  params: OutsourceableOperationsParams
) =>
  queryOptions({
    queryKey: ["outsourcing-orders", "outsourceable-operations", params],
    queryFn: () => getOutsourceableOperations({ data: params }),
  })
