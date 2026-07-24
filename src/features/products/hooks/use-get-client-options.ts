import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { clientOptionsQueryOptions } from "@/features/products/queries/client-options.query"

// Server-searched options for the "Khách hàng" combobox: debounces the typed
// term and reads clientOptionsQueryOptions (GET /api/clients?q=...) from the
// shared query cache. `select` maps the raw {id,name} rows to the {value,label}
// pairs ComboboxField expects; `onSearchChange` is the debounced setter.
export function useGetClientOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...clientOptionsQueryOptions(q),
    select: (clients) =>
      clients.map((client) => ({ value: client.id, label: client.name })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
