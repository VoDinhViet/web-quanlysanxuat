import { queryOptions } from "@tanstack/react-query"

import { getOperationsList } from "@/features/operations/api/server-functions/get-operations-list.api"

export const operationsQueryOptions = () =>
  queryOptions({
    queryKey: ["operations", "list"],
    queryFn: () => getOperationsList(),
    staleTime: 5 * 60_000,
  })
