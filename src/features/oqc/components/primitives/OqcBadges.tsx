import { Badge } from "@/components/ui/badge"
import { iqcResultLabels, IqcResult } from "@/lib/types/iqc.type"
import {
  oqcDispositionLabels,
  oqcStatusLabels,
  OqcDisposition,
  OqcStatus,
} from "@/lib/types/oqc.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

const oqcResultStyles: Record<IqcResult, BadgeStyle> = {
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
  [OqcStatus.DRAFT]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [OqcStatus.PENDING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  // Cùng tông xanh dương với IqcStatus.IN_PROGRESS — cả 2 đều là "FAIL, đã chọn hướng xử lý,
  // đang ở vòng lặp tiếp theo", phân biệt được với PENDING (FAIL, chưa chọn gì).
  [OqcStatus.IN_PROGRESS]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
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

const oqcDispositionStyles: Record<OqcDisposition, BadgeStyle> = {
  [OqcDisposition.ACCEPT]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [OqcDisposition.REWORK]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [OqcDisposition.SCRAP]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type OqcDispositionBadgeProps = {
  disposition: OqcDisposition
  className?: string
}

// Takes a non-null disposition only — PASS rows have none at all (DB check constraint
// `chk_oqc_inspections_disposition_requires_fail`).
export function OqcDispositionBadge({
  disposition,
  className,
}: OqcDispositionBadgeProps) {
  const { badge, dot } = oqcDispositionStyles[disposition]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {oqcDispositionLabels[disposition]}
    </Badge>
  )
}
