import { Factory } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"

const EMPTY_STATE_COPY: Record<
  ProductionOrderStatus,
  { title: string; description: string }
> = {
  [ProductionOrderStatus.PENDING]: {
    title: "Không có đơn hàng nào chờ tạo LSX",
    description: "Đơn hàng sẽ xuất hiện ở đây sau khi được Giám đốc duyệt.",
  },
  [ProductionOrderStatus.CREATED]: {
    title: "Chưa có lệnh sản xuất nào",
    description:
      "Lệnh sản xuất sẽ xuất hiện ở đây sau khi được tạo từ đơn hàng đã duyệt.",
  },
}

type ProductionOrdersEmptyStateProps = {
  status: ProductionOrderStatus
}

export function ProductionOrdersEmptyState({
  status,
}: ProductionOrdersEmptyStateProps) {
  const copy = EMPTY_STATE_COPY[status]

  return (
    <TableEmptyState
      icon={Factory}
      title={copy.title}
      description={copy.description}
    />
  )
}
