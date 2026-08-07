import { queryOptions } from "@tanstack/react-query"

import { getItemOperations } from "@/features/products/api/server-functions/get-item-operations.api"

// The routing (Công đoạn) is scoped to the whole item, not to individual
// BOM lines — same nesting rationale as itemBomQueryOptions.
export const itemOperationsQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ["items", "detail", itemId, "operations"],
    queryFn: () => getItemOperations({ data: { itemId } }),
  })
