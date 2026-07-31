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

// No filter selected ("Tất cả") gets its own generic copy rather than indexing
// EMPTY_STATE_COPY, since there's no single status to describe.
const ALL_EMPTY_STATE_COPY = {
  title: "Chưa có lệnh sản xuất nào",
  description: "Lệnh sản xuất được tạo tự động khi Giám đốc duyệt đơn hàng.",
}

type ProductionOrdersEmptyStateProps = {
  status: ProductionOrderStatus | undefined
}

export function ProductionOrdersEmptyState({
  status,
}: ProductionOrdersEmptyStateProps) {
  const copy = status ? EMPTY_STATE_COPY[status] : ALL_EMPTY_STATE_COPY

  return (
    <TableEmptyState
      icon={Factory}
      title={copy.title}
      description={copy.description}
    />
  )
}
