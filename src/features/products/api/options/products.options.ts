import { queryOptions } from "@tanstack/react-query"

import { getProducts } from "@/features/products/api/server-functions/get-products.api"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

export const productsQueryOptions = (search: ProductsSearchSchema) =>
  queryOptions({
    queryKey: ["products", "list", search],
    queryFn: () => getProducts({ data: search }),
  })
