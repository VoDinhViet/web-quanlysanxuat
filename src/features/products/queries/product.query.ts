import { queryOptions } from "@tanstack/react-query"

import { getProduct } from "@/features/products/server-functions/get-product"

export const productQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId],
    queryFn: () => getProduct({ data: { productId } }),
  })
