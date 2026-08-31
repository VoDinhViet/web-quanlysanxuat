import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { itemOptionsQueryOptions } from "@/features/products/api"

// Combobox data hook cho dòng vật tư/thành phẩm của phiếu nhập — `type` truyền vào theo
// `resolveInventoryReceiptItemType(receiptType)` (inventory-receipt.type.ts), không hardcode
// "RM" nữa. Cùng khuôn use-get-item-options.ts của orders, khác ở chỗ itemOptionsQueryOptions
// chỉ trả ItemRef ({id,code,name}, không có unit) nên dòng phiếu không tự hiện đơn vị tính khi
// chọn — chấp nhận được vì unitPrice/note mới là phần người dùng nhập tay.
export function useGetInventoryReceiptItemOptions(type: "RM" | "FG") {
  const [q, setQ] = useDebounceValue("", 300)
  const { data: items = [], isFetching } = useQuery({
    ...itemOptionsQueryOptions({ q, type }),
    placeholderData: keepPreviousData,
  })

  const options = items.map((item) => ({
    value: item.id,
    label: `${item.code} — ${item.name}`,
  }))

  return { items, options, isFetching, onSearchChange: setQ }
}
