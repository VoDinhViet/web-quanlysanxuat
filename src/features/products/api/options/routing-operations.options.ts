import { queryOptions } from "@tanstack/react-query"

import { getRoutingOperations } from "@/features/products/api/server-functions/get-routing-operations.api"

// Nested under `["items", "detail", productId, ...]` như `itemBomQueryOptions` — mọi mutation công
// đoạn Cấp 0 (`useProductOperations`) đang `invalidateQueries({ queryKey: ["items"] })`, vẫn phủ
// được query này nhờ khớp tiền tố, không cần sửa thêm chỗ đó.
export const itemOperationsQueryOptions = (productId: string) =>
  queryOptions({
    queryKey: ["items", "detail", productId, "operations"],
    queryFn: async () => {
      const response = await getRoutingOperations({ data: { itemId: productId } })
      return response.data
    },
  })
