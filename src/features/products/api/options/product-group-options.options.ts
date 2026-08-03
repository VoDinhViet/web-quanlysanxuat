import { queryOptions } from "@tanstack/react-query"

import { getProductGroups } from "@/features/products/api/server-functions/get-product-groups.api"

export const productGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "group-options"],
    queryFn: () => getProductGroups(),
    staleTime: 5 * 60_000,
  })
