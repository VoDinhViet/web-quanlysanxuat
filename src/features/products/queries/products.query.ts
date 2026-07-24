import { queryOptions } from "@tanstack/react-query"

import { getProducts } from "@/features/products/server-functions/get-products"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

// Query key convention (see .claude/rules/architecture.md): `["products"]` is the
// feature root, so `invalidateQueries({ queryKey: ["products"] })` after a write
// refreshes list + detail in one call.
export const productsQueryOptions = (search: ProductsSearchSchema) =>
  queryOptions({
    queryKey: ["products", "list", search],
    queryFn: () => getProducts({ data: search }),
  })
