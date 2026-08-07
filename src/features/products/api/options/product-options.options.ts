import { queryOptions } from "@tanstack/react-query"

import { getProductOptions } from "@/features/products/api/server-functions/get-product-options.api"

type ProductOptionsFilter = {
  q: string
  type?: "FG" | "WIP" | "RM"
}

// Purpose-built dropdown endpoint (GET /api/items/options) — this feature's
// own "add BOM item" dialog picks `type: WIP` or `type: RM` depending on the
// node type toggle (only WIP/RM may be added as a structure node, backend
// rejects FG, E053); the backend always filters ACTIVE, so there's no
// `status` param here. Returns only `{id, code, name}` (ProductRef), not the
// full `Product` — see order-product-options.options.ts for the picker that
// needs more.
export const productOptionsQueryOptions = (filter: ProductOptionsFilter) =>
  queryOptions({
    queryKey: ["products", "options", filter],
    queryFn: () => getProductOptions({ data: filter }),
    staleTime: 5 * 60_000,
  })
