import { queryOptions } from "@tanstack/react-query"

import { getUnits } from "@/lib/server-functions/get-units"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

export const unitOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["products", "unit-options"],
    queryFn: () => getUnits({ data: { scope: "PRODUCT" } }),
    staleTime: REFERENCE_STALE_TIME,
  })
