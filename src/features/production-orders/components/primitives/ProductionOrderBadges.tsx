import { Badge } from "@/components/ui/badge"
import {
  productionOrderStatusLabels,
  ProductionOrderStatus,
} from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

type ToneBadgeStyle = {
  badge: string
  dot: string
}

// Single badge for `production_orders.status` — used both by the list queue (GET
// /production-orders) and the detail screen (GET /production-orders/:productionOrderId), since
// both read the same column.
const toneStyles: Record<ProductionOrderStatus, ToneBadgeStyle> = {
  [ProductionOrderStatus.PENDING]: {
    badge: "bg-warning-soft text-warning-ink",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [ProductionOrderStatus.APPROVED]: {
    badge: "bg-info-soft text-info-ink",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [ProductionOrderStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
}

type ProductionOrderStatusBadgeProps = {
  tone: ProductionOrderStatus
  className?: string
}

export function ProductionOrderStatusBadge({
  tone,
  className,
}: ProductionOrderStatusBadgeProps) {
  const { badge, dot } = toneStyles[tone]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {productionOrderStatusLabels[tone]}
    </Badge>
  )
}
