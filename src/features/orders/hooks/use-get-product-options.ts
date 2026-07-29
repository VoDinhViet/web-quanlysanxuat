import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { productOptionsQueryOptions } from "@/features/products/api"

// Keeps the full `Product[]` (not mapped to `{value,label}`) — OrderItemDialog
// reads `unit`/`image` off the selected product to fill the line read-only.
export function useGetProductOptions() {
  const [q, setQ] = useDebounceValue("", 300)
  const { data: products = [], isFetching } = useQuery({
    ...productOptionsQueryOptions({ q }),
    placeholderData: keepPreviousData,
  })

  const options = products.map((product) => ({
    value: product.id,
    label: `${product.code} — ${product.name}`,
  }))

  return { products, options, isFetching, onSearchChange: setQ }
}
