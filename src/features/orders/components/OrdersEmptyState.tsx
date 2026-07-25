import { ClipboardList } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"

export function OrdersEmptyState() {
  return (
    <TableEmptyState
      icon={ClipboardList}
      title="Chưa có đơn hàng nào"
      description="Đơn hàng sẽ xuất hiện ở đây sau khi được tạo."
    />
  )
}
