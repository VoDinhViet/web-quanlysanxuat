import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { orderItemOptionsQueryOptions } from "@/features/products/api"

// Keeps the full `Item[]` (not mapped to `{value,label}`) — OrderItemDialog
// reads `unit`/`image` off the selected item to fill the line read-only.
export function useGetItemOptions() {
  const [q, setQ] = useDebounceValue("", 300)
  const { data: items = [], isFetching } = useQuery({
    ...orderItemOptionsQueryOptions(q),
    placeholderData: keepPreviousData,
  })

  const options = items.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.name}`,
  }))

  return { items, options, isFetching, onSearchChange: setQ }
}
