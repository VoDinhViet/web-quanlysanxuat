import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { productOptionsQueryOptions } from "@/features/products/api/options"
import type { BomNodeItemType } from "@/lib/types/bom-item.type"

// Server-searched options for the "add BOM item" picker, via
// GET /api/items/options — only WIP (sub-assembly) or RM (vật tư) items may
// be added as a structure node (backend rejects FG, E053), so `nodeType`
// picks which one the caller's type toggle is currently on; the endpoint
// itself always filters ACTIVE. Debounces the typed term and maps the
// `ProductRef` rows to the {value,label} pairs ComboboxField expects. Mirrors
// use-get-client-options.
export function useGetBomProductOptions(nodeType: BomNodeItemType) {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...productOptionsQueryOptions({
      q,
      type: nodeType,
    }),
    select: (rows) =>
      rows.map((row) => ({
        value: row.id,
        label: `${row.code} - ${row.name}`,
      })),
    placeholderData: keepPreviousData,
  })

  return { options, isFetching, onSearchChange: setQ }
}
