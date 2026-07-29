import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  PRODUCTION_ORDER_DECISION_STATUS_LABELS,
  PRODUCTION_ORDER_STATUS_LABELS,
  ProductionOrderDecisionStatus,
  ProductionOrderStatus,
} from "@/lib/types/production-order.type"
import { cn } from "@/lib/utils"

const productionOrderBadgeVariants = cva("", {
  variants: {
    tone: {
      [ProductionOrderStatus.PENDING]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [ProductionOrderStatus.CREATED]: "bg-success/10 text-success",
    },
  },
})

const PRODUCTION_ORDER_BADGE_DOT_CLASSNAME: Record<
  ProductionOrderStatus,
  string
> = {
  [ProductionOrderStatus.PENDING]: "bg-amber-500 dark:bg-amber-400",
  [ProductionOrderStatus.CREATED]: "bg-success",
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

// Badge for the real decision status on the detail screen — distinct from
// ProductionOrderStatusBadge above (the list's own suy-diễn status).
const productionOrderDecisionBadgeVariants = cva("", {
  variants: {
    tone: {
      [ProductionOrderDecisionStatus.PENDING]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [ProductionOrderDecisionStatus.ISSUED]: "bg-success/10 text-success",
    },
  },
})

const PRODUCTION_ORDER_DECISION_BADGE_DOT_CLASSNAME: Record<
  ProductionOrderDecisionStatus,
  string
> = {
  [ProductionOrderDecisionStatus.PENDING]: "bg-amber-500 dark:bg-amber-400",
  [ProductionOrderDecisionStatus.ISSUED]: "bg-success",
}

type ProductionOrderDecisionStatusBadgeProps = {
  tone: ProductionOrderDecisionStatus
  className?: string
}

export function ProductionOrderDecisionStatusBadge({
  tone,
  className,
}: ProductionOrderDecisionStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(productionOrderDecisionBadgeVariants({ tone }), className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          PRODUCTION_ORDER_DECISION_BADGE_DOT_CLASSNAME[tone]
        )}
      />
      {PRODUCTION_ORDER_DECISION_STATUS_LABELS[tone]}
    </Badge>
  )
}
