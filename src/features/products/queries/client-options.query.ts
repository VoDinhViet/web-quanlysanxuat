import { queryOptions } from "@tanstack/react-query"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getClients } from "@/lib/server-functions/get-clients"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// `q` is the combobox search term; the loader prefetches `q === ""` (initial
// page) and the combobox hook keys off the debounced term for later lookups.
//
// `getClients` (below) is shared with the clients list page, where a failed
// fetch must throw so the errorComponent kicks in — but this dropdown is
// non-core and a products-only role may lack `clients:read`. This query is
// `ensureQueryData`'d straight from a route loader (products list), which
// doesn't catch — so degrading to `[]` has to happen in the queryFn itself.
export const clientOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "client-options", q],
    queryFn: () =>
      getClients({ data: { q: q || undefined, limit: FILTER_OPTIONS_LIMIT } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
