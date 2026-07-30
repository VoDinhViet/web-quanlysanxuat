import { Factory } from "lucide-react"

import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"

const EMPTY_STATE_COPY: Record<
  ProductionOrderStatus,
  { title: string; description: string }
> = {
  [ProductionOrderStatus.PENDING]: {
    title: "Không có lệnh sản xuất nào chờ duyệt",
    description: "Lệnh sản xuất được tạo tự động khi Giám đốc duyệt đơn hàng.",
  },
  [ProductionOrderStatus.APPROVED]: {
    title: "Chưa có lệnh sản xuất nào được duyệt",
    description:
      "Lệnh sản xuất sẽ xuất hiện ở đây sau khi được duyệt ở màn hình chi tiết LSX.",
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
