import { Badge } from "@/components/ui/badge"
import {
  ORDER_STATUS_LABELS,
  OVERDUE_FILTER_VALUE,
  OVERDUE_LABEL,
  OrderStatus,
} from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

// "Trễ hạn" is not an OrderStatus — it gets a style here so the legend and the
// filter select can render it with the same treatment as the real statuses.
export type OrderBadgeTone = OrderStatus | typeof OVERDUE_FILTER_VALUE

type OrderBadgeStyle = {
  badge: string
  dot: string
}

// OrderStatusLegend also reads this map, to render the dot on its own without
// a badge — so it stays exported here rather than duplicated.
export const orderBadgeStyles: Record<OrderBadgeTone, OrderBadgeStyle> = {
  [OrderStatus.DRAFT]: {
    // Dashed + transparent — "not sent yet", distinct from CANCELLED's solid muted tone.
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [OrderStatus.PENDING_CONFIRMATION]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [OrderStatus.AWAITING_PRODUCTION]: {
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  [OrderStatus.IN_PROGRESS]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [OrderStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [OrderStatus.CANCELLED]: {
    // Neutral, not destructive — a cancelled order is inert, not a warning
    // like "Trễ hạn" (which already owns the destructive tone below).
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  [OVERDUE_FILTER_VALUE]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
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
  const { badge, dot } = orderBadgeStyles[tone]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {ORDER_BADGE_LABELS[tone]}
    </Badge>
  )
}
