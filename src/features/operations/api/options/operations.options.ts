import { queryOptions } from "@tanstack/react-query"

import { getOperations } from "@/features/operations/api/server-functions/get-operations.api"
import type { OperationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"

export const operationsQueryOptions = (search: OperationsSearchSchema = {}) =>
  queryOptions({
    queryKey: ["operations", "list", search],
    queryFn: () => getOperations({ data: search }),
    staleTime: 5 * 60_000,
  })
