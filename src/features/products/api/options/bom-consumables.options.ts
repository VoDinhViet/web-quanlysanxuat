import { queryOptions } from "@tanstack/react-query"

import { getBomConsumables } from "@/features/products/api/server-functions/get-bom-consumables.api"

type BomConsumablesQuery = {
  page: number
  limit: number
  q?: string
}

// Nested under `["items", "detail", productId, "bom", ...]` như `itemBomQueryOptions` — mọi
// mutation vật tư (`useProductBom`) đang `invalidateQueries({ queryKey: ["items"] })`, vẫn phủ
// được query này nhờ khớp tiền tố, không cần sửa thêm chỗ đó. Phân trang/tìm kiếm thật ở BE (không
// lọc client-side từ cây đầy đủ) — xem BomItemConsumablesTable.tsx.
export const bomItemConsumablesQueryOptions = (
  productId: string,
  bomItemId: string,
  query: BomConsumablesQuery
) =>
  queryOptions({
    queryKey: [
      "items",
      "detail",
      productId,
      "bom",
      bomItemId,
      "consumables",
      query,
    ],
    queryFn: () =>
      getBomConsumables({ data: { itemId: productId, bomItemId, ...query } }),
  })
