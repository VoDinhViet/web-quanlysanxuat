import { queryOptions } from "@tanstack/react-query"

import { getUnitOptions } from "@/features/products/server-functions/get-unit-options"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "unit-options"],
    queryFn: () => getUnitOptions(),
    staleTime: REFERENCE_STALE_TIME,
  })
