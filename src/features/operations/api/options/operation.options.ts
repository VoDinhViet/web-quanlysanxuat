import { queryOptions } from "@tanstack/react-query"

import { getOperation } from "@/features/operations/api/server-functions/get-operation.api"

export const operationQueryOptions = (operationId: string) =>
  queryOptions({
    queryKey: ["operations", "detail", operationId],
    queryFn: () => getOperation({ data: { operationId } }),
  })
