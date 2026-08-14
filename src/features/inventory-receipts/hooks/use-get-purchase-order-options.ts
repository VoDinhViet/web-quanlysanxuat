import { useQuery } from "@tanstack/react-query"
import { useDebounceValue } from "usehooks-ts"

import { purchaseOrdersQueryOptions } from "@/features/purchase-orders/api"
import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"

// Combobox chọn PO cho phiếu nhập kho — chỉ gợi ý PO đang `ORDERED` (còn nhận hàng được), lọc
// phía client vì `purchaseOrdersQueryOptions` chỉ có filter theo `progress` (bucket đã tính toán,
// gồm cả RECEIVING) chứ không có filter thẳng theo `status`. Dùng chung cho cả form tạo lẫn form
// sửa: hook thuần, không bind theo shape của form nào nên không vướng ràng buộc kiểu `withForm`
// vốn buộc phải tách đôi các *ItemsSection.
export function useGetPurchaseOrderOptions() {
  const [q, setQ] = useDebounceValue("", 300)
  const { data, isFetching } = useQuery(
    purchaseOrdersQueryOptions({ page: 1, limit: 50, q: q || undefined })
  )

  const orderedPurchaseOrders = (data?.data ?? []).filter(
    (purchaseOrder) => purchaseOrder.status === PurchaseOrderStatus.ORDERED
  )
  const options = orderedPurchaseOrders.map((purchaseOrder) => ({
    value: purchaseOrder.id,
    label: purchaseOrder.code,
  }))

  return { options, isFetching, onSearchChange: setQ }
}
