import { queryOptions } from "@tanstack/react-query"

import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

export const productGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "group-options"],
    queryFn: () => getProductGroupFilterOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })
