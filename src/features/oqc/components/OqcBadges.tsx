import { Badge } from "@/components/ui/badge"
import { iqcResultLabels, IqcResult } from "@/lib/types/iqc.type"
import { oqcStatusLabels, OqcStatus } from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const oqcResultStyles: Record<IqcResult, BadgeStyle> = {
  [IqcResult.PASS]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [IqcResult.FAIL]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type OqcResultBadgeProps = {
  result: IqcResult | null
  className?: string
}

// `result` is null for a NOT_INSPECTED row — chưa xác nhận kết quả.
export function OqcResultBadge({ result, className }: OqcResultBadgeProps) {
  if (!result) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const { badge, dot } = oqcResultStyles[result]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {iqcResultLabels[result]}
    </Badge>
  )
}

export const oqcStatusStyles: Record<OqcStatus, BadgeStyle> = {
  [OqcStatus.NOT_INSPECTED]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [OqcStatus.PENDING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [OqcStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
}

type OqcStatusBadgeProps = {
  status: OqcStatus
  className?: string
}

export function OqcStatusBadge({ status, className }: OqcStatusBadgeProps) {
  const { badge, dot } = oqcStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {oqcStatusLabels[status]}
    </Badge>
  )
}
