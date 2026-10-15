import { Badge } from "@/components/ui/badge"
import { iqcResultLabels, IqcResult } from "@/lib/types/iqc.type"
import {
  ncrStatusLabels,
  ncrTypeLabels,
  NcrStatus,
  NcrType,
} from "@/lib/types/ncr.type"
import { oqcStatusLabels } from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"
import type { NcrOqcRef } from "@/lib/types/ncr.type"

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

const oqcRefResultStyles: Record<IqcResult, BadgeStyle> = {
  [IqcResult.PASS]: {
    badge: "bg-success-soft text-success-ink",
    dot: "bg-success",
  },
  [IqcResult.FAIL]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

const oqcRefPendingStyle: BadgeStyle = {
  badge: "bg-neutral-soft text-neutral-ink",
  dot: "bg-muted-foreground/50",
}

type NcrOqcRefBadgeProps = {
  oqc: Pick<NcrOqcRef, "result" | "status">
  className?: string
}

/** Kết quả của phiếu OQC tham chiếu trong thẻ truy vết; chưa có kết quả thì hiện trạng thái phiếu. */
export function NcrOqcRefBadge({ oqc, className }: NcrOqcRefBadgeProps) {
  const { badge, dot } = oqc.result
    ? oqcRefResultStyles[oqc.result]
    : oqcRefPendingStyle

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {oqc.result ? iqcResultLabels[oqc.result] : oqcStatusLabels[oqc.status]}
    </Badge>
  )
}
