import { Badge } from "@/components/ui/badge"
import type { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import { outboundOrderStatusLabels } from "@/lib/types/outbound-order.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const outboundOrderStatusStyles: Record<
  OutboundOrderStatus,
  BadgeStyle
> = {
  DRAFT: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  PENDING_APPROVAL: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  PENDING_DELIVERY: {
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    dot: "bg-sky-500 dark:bg-sky-400",
  },
  DELIVERED: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  REJECTED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

export function OutboundOrderStatusBadge({
  status,
  className,
}: {
  status: OutboundOrderStatus
  className?: string
}) {
  const { badge, dot } = outboundOrderStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outboundOrderStatusLabels[status]}
    </Badge>
  )
}
