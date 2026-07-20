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
    className: "bg-blue-50 text-blue-700 ring-blue-600/15",
    dot: "bg-blue-500",
  },
  [OrderStatus.COMPLETED]: {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    dot: "bg-emerald-500",
  },
  [OrderStatus.PENDING_PRODUCTION]: {
    className: "bg-orange-50 text-orange-700 ring-orange-600/15",
    dot: "bg-orange-500",
  },
  [OrderStatus.PENDING_OUTSOURCING]: {
    className: "bg-violet-50 text-violet-700 ring-violet-600/15",
    dot: "bg-violet-500",
  },
  [OrderStatus.PENDING_CONFIRMATION]: {
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/15",
    dot: "bg-yellow-500",
  },
  [OVERDUE_FILTER_VALUE]: {
    className: "bg-red-50 text-red-700 ring-red-600/15",
    dot: "bg-red-500",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        styleClassName,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {ORDER_BADGE_LABELS[tone]}
    </span>
  )
}
