import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { itemOptionsQueryOptions } from "@/features/products/api"

// Combobox data hook cho dòng vật tư của đề xuất mua hàng — luôn lọc type: "RM" (đề xuất chỉ
// mua nguyên vật liệu). Cùng khuôn inventory-receipts/hooks/use-get-material-options.ts,
// nhân bản riêng cho feature này (không import chéo hook giữa 2 feature — xem
// .claude/rules/architecture.md). itemOptionsQueryOptions chỉ trả ItemRef ({id,code,name},
// không có unit) nên dòng đề xuất không tự hiện đơn vị tính khi chọn.
export function useGetMaterialOptions() {
  const [q, setQ] = useDebounceValue("", 300)
  const { data: items = [], isFetching } = useQuery({
    ...itemOptionsQueryOptions({ q, type: "RM" }),
    placeholderData: keepPreviousData,
  })

  const options = items.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.name}`,
  }))

  return { items, options, isFetching, onSearchChange: setQ }
}
