import { queryOptions } from "@tanstack/react-query"

import { getClientOptions } from "@/features/products/server-functions/get-client-options"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// `q` is the combobox search term; the loader prefetches `q === ""` (initial
// page) and the combobox hook keys off the debounced term for later lookups.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "client-options", q],
    queryFn: () => getClientOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
