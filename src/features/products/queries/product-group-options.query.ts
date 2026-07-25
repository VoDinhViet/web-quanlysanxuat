import { queryOptions } from "@tanstack/react-query"

import { getProductGroups } from "@/lib/server-functions/get-product-groups"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

export const productGroupOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "group-options"],
    queryFn: () => getProductGroups(),
    staleTime: REFERENCE_STALE_TIME,
  })
