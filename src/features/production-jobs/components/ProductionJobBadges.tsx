import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  PRODUCTION_JOB_STATUS_LABELS,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const productionJobStatusBadgeVariants = cva("", {
  variants: {
    status: {
      [ProductionJobStatus.PENDING]: "bg-muted text-muted-foreground",
      [ProductionJobStatus.IN_PROGRESS]:
        "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      [ProductionJobStatus.WAITING]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    },
  },
})

const PRODUCTION_JOB_STATUS_DOT_CLASSNAME: Record<ProductionJobStatus, string> =
  {
    [ProductionJobStatus.PENDING]: "bg-muted-foreground/50",
    [ProductionJobStatus.IN_PROGRESS]: "bg-blue-500 dark:bg-blue-400",
    [ProductionJobStatus.WAITING]: "bg-amber-500 dark:bg-amber-400",
  }

type ProductionJobStatusBadgeProps = {
  status: ProductionJobStatus
  className?: string
}

export function ProductionJobStatusBadge({
  status,
  className,
}: ProductionJobStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(productionJobStatusBadgeVariants({ status }), className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          PRODUCTION_JOB_STATUS_DOT_CLASSNAME[status]
        )}
      />
      {PRODUCTION_JOB_STATUS_LABELS[status]}
    </Badge>
  )
}

type ProductionJobWarningBadgeProps = {
  warning: boolean
  className?: string
}

// `warning` is a plain boolean off the row (ProductionJobResDto.warning, computed server-side in
// SQL) — trễ hạn giao hàng mà sản xuất chưa đủ số, see production-job.type.ts. No "levels" to
// derive client-side, so this renders exactly two states.
export function ProductionJobWarningBadge({
  warning,
  className,
}: ProductionJobWarningBadgeProps) {
  if (!warning) {
    return <span className={cn("text-muted-foreground", className)}>—</span>
  }

  return (
    <Badge
      variant="outline"
      className={cn("bg-destructive/10 text-destructive", className)}
    >
      <span className="size-1.5 rounded-full bg-destructive" />
      Cảnh báo
    </Badge>
  )
}
