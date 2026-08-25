import { queryOptions } from "@tanstack/react-query"

import { getOperations } from "@/features/operations/api/server-functions/get-operations.api"
import type { OperationType } from "@/lib/types/operation.type"

// Narrow picker variant for the BOM/routing step combobox (id/code/name/type only, silent-fail
// on error) — distinct from `operationsQueryOptions`, the full-detail list backing the
// `/manage/operations` management screen (`operations.options.ts`).
export const operationOptionsQueryOptions = (q: string, type?: OperationType) =>
  queryOptions({
    queryKey: ["operations", "options", q, type],
    queryFn: () => getOperations({ data: { q, type } }),
    staleTime: 5 * 60_000,
  })
