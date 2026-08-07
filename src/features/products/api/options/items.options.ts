import { queryOptions } from "@tanstack/react-query"

import { getItems } from "@/features/products/api/server-functions/get-items.api"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"

export const itemsQueryOptions = (search: ProductsSearchSchema) =>
  queryOptions({
    queryKey: ["items", "list", search],
    queryFn: () => getItems({ data: search }),
  })
