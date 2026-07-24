import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { bomMaterialOptionsQueryOptions } from "@/features/products/queries/bom-material-options.query"

// Server-searched options for the "add BOM item" material picker: debounces the
// typed term and maps {id,code,name} rows to {value,label}. Mirrors
// use-get-client-options.
export function useGetBomMaterialOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...bomMaterialOptionsQueryOptions(q),
    select: (rows) =>
      rows.map((row) => ({
        value: row.id,
        label: `${row.code} - ${row.name}`,
      })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
