import { queryOptions } from "@tanstack/react-query"

import { getItem } from "@/features/products/api/server-functions/get-item.api"

export const itemQueryOptions = (itemId: string) =>
  queryOptions({
    queryKey: ["items", "detail", itemId],
    queryFn: () => getItem({ data: { itemId } }),
  })
