import { queryOptions } from "@tanstack/react-query"

import { getInventoryIssues } from "@/features/inventory-issues/api/server-functions/get-inventory-issues.api"
import type { InventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"

export const inventoryIssuesQueryOptions = (
  search: InventoryIssuesSearchSchema
) =>
  queryOptions({
    queryKey: ["inventory-issues", "list", search],
    queryFn: () => getInventoryIssues({ data: search }),
  })
