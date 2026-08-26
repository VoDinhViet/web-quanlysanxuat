import { queryOptions } from "@tanstack/react-query"

import { getItemIssues } from "@/features/products/api/server-functions/get-item-issues.api"

type ItemIssuesSearch = {
  page?: number
  limit?: number
  q?: string
}

// Scoped to the item, so it nests under the detail key like itemBomQueryOptions —
// `invalidateQueries({ queryKey: ["items"] })` still covers it.
export const itemIssuesQueryOptions = (
  itemId: string,
  search: ItemIssuesSearch
) =>
  queryOptions({
    queryKey: ["items", "detail", itemId, "issues", search],
    queryFn: () => getItemIssues({ data: { itemId, ...search } }),
  })
