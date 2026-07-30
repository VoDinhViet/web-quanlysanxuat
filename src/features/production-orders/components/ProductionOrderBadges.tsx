import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  PRODUCTION_ORDER_STATUS_LABELS,
  ProductionOrderStatus,
} from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

// Single badge for `production_orders.status` — used both by the list queue (GET
// /production-orders) and the detail screen (GET /production-orders/:productionOrderId), since
// both read the same column.
const productionOrderBadgeVariants = cva("", {
  variants: {
    tone: {
      [ProductionOrderStatus.PENDING]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [ProductionOrderStatus.APPROVED]: "bg-success/10 text-success",
    },
  },
})

const PRODUCTION_ORDER_BADGE_DOT_CLASSNAME: Record<
  ProductionOrderStatus,
  string
> = {
  [ProductionOrderStatus.PENDING]: "bg-amber-500 dark:bg-amber-400",
  [ProductionOrderStatus.APPROVED]: "bg-success",
}

type ProductionOrderStatusBadgeProps = {
  tone: ProductionOrderStatus
  className?: string
}

export function ProductionOrderStatusBadge({
  tone,
  className,
}: ProductionOrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(productionOrderBadgeVariants({ tone }), className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          PRODUCTION_ORDER_BADGE_DOT_CLASSNAME[tone]
        )}
      />
      {PRODUCTION_ORDER_STATUS_LABELS[tone]}
    </Badge>
  )
}
