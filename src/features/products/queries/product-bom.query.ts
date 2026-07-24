import { queryOptions } from "@tanstack/react-query"

import { getProductBom } from "@/features/products/server-functions/get-product-bom"

// The BOM tree is scoped to the product, so it nests under the detail key —
// `invalidateQueries({ queryKey: ["products"] })` still covers it.
export const productBomQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId, "bom"],
    queryFn: () => getProductBom({ data: { productId } }),
  })
