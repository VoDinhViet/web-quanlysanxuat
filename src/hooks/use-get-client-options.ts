import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getClients } from "@/lib/server-functions/get-clients"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Distinct on purpose from clients.query.ts's `clientsQueryOptions` (paginated
// list for the clients page) and `clientQueryOptions` (single client by id):
// same underlying `getClients` call, but a different shape for a different
// job — see the "Broader than any single caller's own search schema" comment
// on `getClientsSchema` (get-clients.ts), which already anticipated this
// split: `getClients` stays generic precisely so the clients list page (full
// paginated filters) and this cross-domain reference dropdown (just `q` + a
// larger `limit`, unwrapped to a flat array) can both use it without either
// one forcing its shape on the other. Shared across products/materials/
// orders, so this is a flat top-level key rather than feature-rooted: it
// isn't owned by any one feature's `invalidateQueries({queryKey:[<feature>]})`,
// and a client write doesn't invalidate it from any feature today regardless
// (staleTime handles freshness). A failed fetch degrades to `[]` — this
// dropdown is non-core and callers may lack `clients:read`.
export const searchClientsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["client-options", q],
    queryFn: () =>
      getClients({ data: { q: q || undefined, limit: FILTER_OPTIONS_LIMIT } })
        .then((response) => response.data)
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })

// Server-searched options for the "Khách hàng" combobox: debounces the typed
// term and reads searchClientsQueryOptions from the shared query cache.
// Returns the raw `clients` too (not just `{value,label}`) — orders' contact
// picker reads each client's embedded `contacts[]` off it without a second
// request; products/materials simply ignore that field.
export function useGetClientOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: clients = [], isFetching } = useQuery({
    ...searchClientsQueryOptions(q),
    placeholderData: keepPreviousData,
  })

  const options = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }))

  return { clients, options, isFetching, onSearchChange: setQ }
}
