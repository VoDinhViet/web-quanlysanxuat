import { Badge } from "@/components/ui/badge"
import {
  ncrStatusLabels,
  ncrTypeLabels,
  NcrStatus,
  NcrType,
} from "@/lib/types/ncr.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<NcrStatus, BadgeStyle> = {
  [NcrStatus.OPEN]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  [NcrStatus.PENDING_APPROVAL]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [NcrStatus.APPROVED]: {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  [NcrStatus.IN_PROGRESS]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [NcrStatus.PENDING_QC]: {
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    dot: "bg-violet-500 dark:bg-violet-400",
  },
  [NcrStatus.CLOSED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [NcrStatus.REJECTED]: {
    badge: "bg-destructive/10 text-destructive dark:bg-destructive/15",
    dot: "bg-destructive",
  },
}

type NcrStatusBadgeProps = {
  status: NcrStatus
  className?: string
}

export function NcrStatusBadge({ status, className }: NcrStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {ncrStatusLabels[status]}
    </Badge>
  )
}

const typeStyles: Record<NcrType, string> = {
  [NcrType.INTERNAL]:
    "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  [NcrType.CUSTOMER]:
    "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
}

type NcrTypeBadgeProps = {
  type: NcrType
  className?: string
}

export function NcrTypeBadge({ type, className }: NcrTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn(typeStyles[type], className)}>
      {ncrTypeLabels[type]}
    </Badge>
  )
}
