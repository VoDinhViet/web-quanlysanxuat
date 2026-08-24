import { Factory } from "lucide-react"

import { TableEmpty } from "@/components/shared/feedback/TableEmpty"
import { ProductionOrderStatus } from "@/lib/types/production-order.type"

const emptyStateCopy: Record<
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
  [ProductionOrderStatus.COMPLETED]: {
    title: "Chưa có lệnh sản xuất nào hoàn thành",
    description: "LSX tự chuyển hoàn thành khi mọi Job của nó đã sản xuất xong.",
  },
}

// No filter selected ("Tất cả") gets its own generic copy rather than indexing
// emptyStateCopy, since there's no single status to describe.
const allEmptyStateCopy = {
  title: "Chưa có lệnh sản xuất nào",
  description: "Lệnh sản xuất được tạo tự động khi Giám đốc duyệt đơn hàng.",
}

type ProductionOrdersEmptyStateProps = {
  status: ProductionOrderStatus | undefined
}

export function ProductionOrdersEmptyState({
  status,
}: ProductionOrdersEmptyStateProps) {
  const copy = status ? emptyStateCopy[status] : allEmptyStateCopy

  return (
    <TableEmpty
      icon={Factory}
      title={copy.title}
      description={copy.description}
    />
  )
}
