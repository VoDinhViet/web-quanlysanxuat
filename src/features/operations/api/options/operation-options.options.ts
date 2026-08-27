import { queryOptions } from "@tanstack/react-query"

import { getOperationOptions } from "@/features/operations/api/server-functions/get-operation-options.api"

// Narrow picker variant for the BOM/routing step combobox (id/code/name only, silent-fail
// on error) — distinct from `operationsQueryOptions`, the full-detail list backing the
// `/manage/operations` management screen (`operations.options.ts`).
export const operationOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["operations", "options", q],
    queryFn: () => getOperationOptions({ data: { q } }),
    staleTime: 5 * 60_000,
  })
