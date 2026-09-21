import { queryOptions } from "@tanstack/react-query"

import { getItemBom } from "@/features/products/api/server-functions/get-item-bom.api"

// The BOM tree is scoped to the item, so it nests under the detail key —
// `invalidateQueries({ queryKey: ["items"] })` still covers it.
export const itemBomQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ["items", "detail", itemId, "bom"],
    queryFn: () => getItemBom({ data: { itemId } }),
  })
