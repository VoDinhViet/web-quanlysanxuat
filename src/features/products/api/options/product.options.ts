import { queryOptions } from "@tanstack/react-query"

import { getProduct } from "@/features/products/api/server-functions/get-product.api"

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProduct({ data: { productId } }),
  })
