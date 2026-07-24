import { queryOptions } from "@tanstack/react-query"

import { getBomMaterialOptions } from "@/features/products/server-functions/get-bom-material-options"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Picker for the "add BOM item" dialog — materials, searched by the
// debounced `q` term (client-interactive, no loader prefetch).
export const bomMaterialOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "bom-material-options", q],
    queryFn: () => getBomMaterialOptions({ data: { q } }),
    staleTime: REFERENCE_STALE_TIME,
  })
