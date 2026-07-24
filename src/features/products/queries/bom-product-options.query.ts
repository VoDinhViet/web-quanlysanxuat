import { queryOptions } from "@tanstack/react-query"

import { getBomProductOptions } from "@/features/products/server-functions/get-bom-product-options"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Picker for the "add BOM item" dialog — WIP products, searched by the
// debounced `q` term (client-interactive, no loader prefetch).
export const bomProductOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "bom-product-options", q],
    queryFn: () => getBomProductOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
