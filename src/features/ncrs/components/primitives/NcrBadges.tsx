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
    badge: "bg-neutral-soft text-neutral-ink",
    dot: "bg-muted-foreground/50",
  },
  [NcrStatus.PENDING_APPROVAL]: {
    badge: "bg-warning-soft text-warning-ink",
    dot: "bg-warning",
  },
  [NcrStatus.APPROVED]: {
    badge: "bg-success-soft text-success-ink",
    dot: "bg-success",
  },
  [NcrStatus.IN_PROGRESS]: {
    badge: "bg-info-soft text-info-ink",
    dot: "bg-info",
  },
  [NcrStatus.PENDING_QC]: {
    badge: "bg-violet-soft text-violet-ink",
    dot: "bg-violet-ink",
  },
  [NcrStatus.CLOSED]: {
    badge: "bg-success-soft text-success-ink",
    dot: "bg-success",
  },
  [NcrStatus.REJECTED]: {
    badge: "bg-destructive-soft text-destructive-ink",
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
  [NcrType.INTERNAL]: "bg-info-soft text-info-ink",
  [NcrType.CUSTOMER]: "bg-warning-soft text-warning-ink",
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
