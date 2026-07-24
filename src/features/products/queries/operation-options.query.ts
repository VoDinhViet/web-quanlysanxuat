import { queryOptions } from "@tanstack/react-query"

import { getOperationOptions } from "@/features/products/server-functions/get-operation-options"
import type { OperationType } from "@/features/products/types/operation.type"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Picker for the routing section's "add step" combobox — active operations
// only, searched by the debounced `q` term and optionally narrowed to one
// Inhouse/Outsource `type`.
export const operationOptionsQueryOptions = (q: string, type?: OperationType) =>
  queryOptions({
    queryKey: ["products", "operation-options", q, type],
    queryFn: () => getOperationOptions({ data: { q, type } }),
    staleTime: REFERENCE_STALE_TIME,
  })
