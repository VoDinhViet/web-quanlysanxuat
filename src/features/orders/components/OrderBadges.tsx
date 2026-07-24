import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  ORDER_STATUS_LABELS,
  OVERDUE_FILTER_VALUE,
  OVERDUE_LABEL,
  OrderStatus,
} from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"

// "Trễ hạn" is not an OrderStatus — it gets a style here so the legend and the
// filter select can render it with the same treatment as the real statuses.
export type OrderBadgeTone = OrderStatus | typeof OVERDUE_FILTER_VALUE

const orderBadgeVariants = cva("", {
  variants: {
    tone: {
      [OrderStatus.IN_PROGRESS]:
        "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      [OrderStatus.COMPLETED]: "bg-success/10 text-success",
      [OrderStatus.PENDING_PRODUCTION]:
        "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
      [OrderStatus.PENDING_OUTSOURCING]:
        "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
      [OrderStatus.PENDING_CONFIRMATION]:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
      [OVERDUE_FILTER_VALUE]: "bg-destructive/10 text-destructive",
    },
  },
})

// The dot tints a child element rather than the badge itself, so it stays a
// plain map — OrderStatusLegend renders it on its own, without a badge.
export const ORDER_BADGE_DOT_CLASSNAME: Record<OrderBadgeTone, string> = {
  [OrderStatus.IN_PROGRESS]: "bg-blue-500 dark:bg-blue-400",
  [OrderStatus.COMPLETED]: "bg-success",
  [OrderStatus.PENDING_PRODUCTION]: "bg-orange-500 dark:bg-orange-400",
  [OrderStatus.PENDING_OUTSOURCING]: "bg-violet-500 dark:bg-violet-400",
  [OrderStatus.PENDING_CONFIRMATION]: "bg-yellow-500 dark:bg-yellow-400",
  [OVERDUE_FILTER_VALUE]: "bg-destructive",
}

export const ORDER_BADGE_LABELS: Record<OrderBadgeTone, string> = {
  ...ORDER_STATUS_LABELS,
  [OVERDUE_FILTER_VALUE]: OVERDUE_LABEL,
}

type OrderStatusBadgeProps = {
  tone: OrderBadgeTone
  className?: string
}

export function OrderStatusBadge({ tone, className }: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(orderBadgeVariants({ tone }), className)}
    >
      <span
        className={cn("size-1.5 rounded-full", ORDER_BADGE_DOT_CLASSNAME[tone])}
      />
      {ORDER_BADGE_LABELS[tone]}
    </Badge>
  )
}
