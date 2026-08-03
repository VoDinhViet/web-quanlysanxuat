import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { productOptionsQueryOptions } from "@/features/products/api/options"
import { ProductType } from "@/lib/types/product.type"

// Server-searched options for the "add BOM item" product picker, via
// GET /api/products/options — only WIP (bán thành phẩm, backend enum
// `WORK_IN_PROGRESS`) products may be added as a structure node (backend
// rejects others, E053), so `type` is fixed here; the endpoint itself always
// filters ACTIVE. Debounces the typed term and maps the `ProductRef` rows to
// the {value,label} pairs ComboboxField expects. Mirrors use-get-client-options.
export function useGetBomProductOptions() {
  const [q, setQ] = useDebounceValue("", 300)

  const { data: options = [], isFetching } = useQuery({
    ...productOptionsQueryOptions({
      q,
      type: ProductType.WORK_IN_PROGRESS,
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
