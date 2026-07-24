import { queryOptions } from "@tanstack/react-query"

import { getProductOperations } from "@/features/products/server-functions/get-product-operations"

// The routing (Công đoạn) is scoped to the whole product, not to individual
// BOM lines — same nesting rationale as productBomQueryOptions.
export const productOperationsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["products", "detail", productId, "operations"],
    queryFn: () => getProductOperations({ data: { productId } }),
  })
