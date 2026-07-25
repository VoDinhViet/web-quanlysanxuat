import { queryOptions } from "@tanstack/react-query"

import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { getProducts } from "@/lib/server-functions/get-products"

// Query key convention (see .claude/rules/architecture.md): `["products"]` is the
// feature root, so `invalidateQueries({ queryKey: ["products"] })` after a write
// refreshes list + detail in one call.
export const productsQueryOptions = (search: ProductsSearchSchema) =>
  queryOptions({
    queryKey: ["products", "list", search],
    queryFn: () => getProducts({ data: search }),
  })
