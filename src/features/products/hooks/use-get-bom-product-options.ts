import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { bomProductOptionsQueryOptions } from "@/features/products/queries/bom-product-options.query"

// Server-searched options for the "add BOM item" product picker (WIP only):
// debounces the typed term and maps the raw {id,code,name} rows to the
// {value,label} pairs ComboboxField expects. Mirrors use-get-client-options.
export function useGetBomProductOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...bomProductOptionsQueryOptions(q),
    select: (rows) =>
      rows.map((row) => ({
        value: row.id,
        label: `${row.code} - ${row.name}`,
      })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
