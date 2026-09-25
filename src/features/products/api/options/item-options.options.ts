import { queryOptions } from "@tanstack/react-query"

import { getItemOptions } from "@/features/products/api/server-functions/get-item-options.api"

type ItemOptionsFilter = {
  q: string
  type?: "FG" | "DIRECT"
}

// Purpose-built dropdown endpoint (GET /api/items/options) — dùng bởi các picker "FG hay DIRECT"
// khác (đơn hàng, phiếu nhập kho...), không phải BOM (node COMPONENT giờ nhập tay code/name, node DIRECT
// dùng picker vật tư riêng, xem DirectsPickerTable). Backend luôn lọc ACTIVE, không có `status`
// param. Trả `{id, code, name}` (ItemRef), không phải full `Item` — xem
// order-item-options.options.ts cho picker cần nhiều hơn.
export const itemOptionsQueryOptions = (filter: ItemOptionsFilter) =>
  queryOptions({
    queryKey: ["items", "options", filter],
    queryFn: () => getItemOptions({ data: filter }),
    staleTime: 5 * 60_000,
  })
