import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { supplierOptionsQueryOptions } from "@/features/suppliers/api/options"
import { buildSelectOptions } from "@/lib/utils"

// Client-side searched options for a "NCC" combobox. Unlike useGetClientOptions,
// supplierOptionsQueryOptions() has no search param of its own — it fetches up to 100 rows once
// (the same list every plain <Select> caller already reads) and degrades to [] on failure. For a
// list this small, filtering the already-fetched rows by name/code as the user types is simpler
// than adding server-side search, and avoids an extra round trip per keystroke.
export function useGetSupplierOptions() {
  const [q, setQ] = useState("")
  const { data: suppliers = [], isFetching } = useQuery(
    supplierOptionsQueryOptions()
  )

  const options = useMemo(() => {
    const term = q.trim().toLowerCase()
    const filtered = term
      ? suppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(term) ||
            supplier.code.toLowerCase().includes(term)
        )
      : suppliers

    return buildSelectOptions(filtered)
  }, [suppliers, q])

  return { suppliers, options, isFetching, onSearchChange: setQ }
}
