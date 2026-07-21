import {
  ORDER_STATUS_LABELS,
  OVERDUE_FILTER_VALUE,
  OVERDUE_LABEL,
  OrderStatus,
} from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  className: string
  dot: string
}

// "Trễ hạn" is not an OrderStatus — it gets a style here so the legend and the
// filter select can render it with the same treatment as the real statuses.
export type OrderBadgeTone = OrderStatus | typeof OVERDUE_FILTER_VALUE

export const ORDER_BADGE_STYLE: Record<OrderBadgeTone, StatusBadgeStyle> = {
  [OrderStatus.IN_PROGRESS]: {
    className:
      "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [OrderStatus.COMPLETED]: {
    className: "bg-success/10 text-success ring-success/20",
    dot: "bg-success",
  },
  [OrderStatus.PENDING_PRODUCTION]: {
    className:
      "bg-orange-50 text-orange-700 ring-orange-600/15 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
  [OrderStatus.PENDING_OUTSOURCING]: {
    className:
      "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
    dot: "bg-violet-500 dark:bg-violet-400",
  },
  [OrderStatus.PENDING_CONFIRMATION]: {
    className:
      "bg-yellow-50 text-yellow-700 ring-yellow-600/15 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20",
    dot: "bg-yellow-500 dark:bg-yellow-400",
  },
  [OVERDUE_FILTER_VALUE]: {
    className: "bg-destructive/10 text-destructive ring-destructive/20",
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
  const { className: styleClassName, dot } = ORDER_BADGE_STYLE[tone]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        styleClassName,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {ORDER_BADGE_LABELS[tone]}
    </span>
  )
}
