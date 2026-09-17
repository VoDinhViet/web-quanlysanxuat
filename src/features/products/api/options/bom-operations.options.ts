import { queryOptions } from "@tanstack/react-query"

import { getBomOperations } from "@/features/products/api/server-functions/get-bom-operations.api"

// Nested under `["items", "detail", productId, "bom", ...]` như `itemBomQueryOptions` — mọi
// mutation công đoạn (`useProductOperations`) đang `invalidateQueries({ queryKey: ["items"] })`,
// vẫn phủ được query này nhờ khớp tiền tố, không cần sửa thêm chỗ đó.
export const bomItemOperationsQueryOptions = (
  productId: string,
  bomItemId: string
) =>
  queryOptions({
    queryKey: ["items", "detail", productId, "bom", bomItemId, "operations"],
    queryFn: async () => {
      const response = await getBomOperations({
        data: { itemId: productId, bomItemId },
      })
      return response.data
    },
  })
