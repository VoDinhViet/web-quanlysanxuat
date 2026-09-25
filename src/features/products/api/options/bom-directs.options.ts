import { queryOptions } from "@tanstack/react-query"

import { getBomDirects } from "@/features/products/api/server-functions/get-bom-directs.api"

type BomDirectsQuery = {
  page: number
  limit: number
  q?: string
}

// Nested under `["items", "detail", productId, "bom", ...]` như `itemBomQueryOptions` — mọi
// mutation vật tư (`useProductBom`) đang `invalidateQueries({ queryKey: ["items"] })`, vẫn phủ
// được query này nhờ khớp tiền tố, không cần sửa thêm chỗ đó. Phân trang/tìm kiếm thật ở BE (không
// lọc client-side từ cây đầy đủ) — xem BomItemDirectsTable.tsx.
export const bomItemDirectsQueryOptions = (
  productId: string,
  bomItemId: string,
  query: BomDirectsQuery
) =>
  queryOptions({
    queryKey: [
      "items",
      "detail",
      productId,
      "bom",
      bomItemId,
      "directs",
      query,
    ],
    queryFn: () =>
      getBomDirects({ data: { itemId: productId, bomItemId, ...query } }),
  })
