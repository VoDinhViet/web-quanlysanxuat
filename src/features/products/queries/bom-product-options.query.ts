import { queryOptions } from "@tanstack/react-query"

import { FILTER_OPTIONS_LIMIT } from "@/lib/constants"
import { getProducts } from "@/lib/server-functions/get-products"
import { ProductStatus, ProductType } from "@/lib/types/product.type"

// Reference lists change rarely — cache them longer so moving between
// list/create/update doesn't refetch them on every navigation.
const REFERENCE_STALE_TIME = 5 * 60_000

// Picker for the "add BOM item" dialog — only WIP (bán thành phẩm, backend
// enum `WORK_IN_PROGRESS`) products may be added as a structure node (backend
// rejects others, E053), so filter `type=WORK_IN_PROGRESS` at the source.
// Narrowed to {id, code, name}. `q` drives the backend's accent-insensitive
// search, searched by the debounced term (client-interactive, no loader
// prefetch). `getProducts` (below) is shared with the products list page,
// where a failed fetch must throw — but this picker is non-core, so it
// degrades to an empty list on failure instead.
export const bomProductOptionsQueryOptions = (q: string) =>
  queryOptions({
    queryKey: ["products", "bom-product-options", q],
    queryFn: () =>
      getProducts({
        data: {
          q: q || undefined,
          type: ProductType.WORK_IN_PROGRESS,
          status: ProductStatus.ACTIVE,
          limit: FILTER_OPTIONS_LIMIT,
        },
      })
        .then((response) =>
          response.data.map(({ id, code, name }) => ({ id, code, name }))
        )
        .catch(() => []),
    staleTime: REFERENCE_STALE_TIME,
  })
