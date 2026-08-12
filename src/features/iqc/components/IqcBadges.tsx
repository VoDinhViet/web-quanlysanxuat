import { Badge } from "@/components/ui/badge"
import {
  iqcDispositionLabels,
  iqcResultLabels,
  iqcStatusLabels,
  IqcDisposition,
  IqcResult,
  IqcStatus,
} from "@/lib/types/iqc.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const iqcResultStyles: Record<IqcResult, BadgeStyle> = {
  [IqcResult.PASS]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [IqcResult.FAIL]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type IqcResultBadgeProps = {
  result: IqcResult
  className?: string
}

export function IqcResultBadge({ result, className }: IqcResultBadgeProps) {
  const { badge, dot } = iqcResultStyles[result]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {iqcResultLabels[result]}
    </Badge>
  )
}

// 3 distinct tones (not just success/warning/destructive) so the values read apart at a glance —
// same idiom as PurchaseOrderBadges.tsx's progress map. RETURN reuses the neutral-dashed tone
// PurchaseOrderBadges uses for DRAFT.
export const iqcDispositionStyles: Record<IqcDisposition, BadgeStyle> = {
  [IqcDisposition.CONCESSION]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [IqcDisposition.SORT]: {
    badge:
      "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    dot: "bg-violet-500 dark:bg-violet-400",
  },
  [IqcDisposition.RETURN]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
}

type IqcDispositionBadgeProps = {
  disposition: IqcDisposition
  className?: string
}

// Takes a non-null disposition only — PASS rows have none at all (DB check constraint
// `chk_iqc_inspections_disposition_requires_fail`), and the table column renders "-" for that
// case itself rather than teaching this badge about null (see IqcTableColumns.tsx).
export function IqcDispositionBadge({
  disposition,
  className,
}: IqcDispositionBadgeProps) {
  const { badge, dot } = iqcDispositionStyles[disposition]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {iqcDispositionLabels[disposition]}
    </Badge>
  )
}

export const iqcStatusStyles: Record<IqcStatus, BadgeStyle> = {
  [IqcStatus.PENDING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [IqcStatus.WAITING_RETURN]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [IqcStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
}

type IqcStatusBadgeProps = {
  status: IqcStatus
  className?: string
}

export function IqcStatusBadge({ status, className }: IqcStatusBadgeProps) {
  const { badge, dot } = iqcStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {iqcStatusLabels[status]}
    </Badge>
  )
}
