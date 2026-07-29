import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { clientOptionsQueryOptions } from "@/features/clients/api/clients.options"
import { buildSelectOptions } from "@/lib/utils"

// Server-searched options for the "Khách hàng" combobox: debounces the typed
// term and reads from the query cache under `clients`' own key — shared
// across products/materials/orders via this feature's `api` barrel; a client
// write invalidates it along with the rest of `["clients"]`.
// `getClientOptions` (GET /api/clients/options) already degrades to `[]` on
// failure, so no `.catch()` is needed here. Returns the raw `clients` too
// (not just `{value,label}`) — callers that need more than `{id,name}` (e.g.
// the client's `code`) can read it off here.
export function useGetClientOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: clients = [], isFetching } = useQuery({
    ...clientOptionsQueryOptions(q),
    placeholderData: keepPreviousData,
  })

  const options = buildSelectOptions(clients)

  return { clients, options, isFetching, onSearchChange: setQ }
}
