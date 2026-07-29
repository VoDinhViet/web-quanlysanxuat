import { queryOptions } from "@tanstack/react-query"

import { getOperations } from "@/features/operations/api/server-functions/get-operations.api"
import { REFERENCE_STALE_TIME } from "@/lib/constants"
import type { OperationType } from "@/lib/types/operation.type"

// `operations` has no UI of its own (no components/pages) — it's an api-only
// feature, same as units/countries: a reference resource used only by
// products today, but master data that products doesn't own.
export const operationOptionsQueryOptions = (q: string, type?: OperationType) =>
  queryOptions({
    queryKey: ["operations", "options", q, type],
    queryFn: () => getOperations({ data: { q, type } }),
    staleTime: REFERENCE_STALE_TIME,
  })
