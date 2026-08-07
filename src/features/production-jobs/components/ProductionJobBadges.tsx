import { Badge } from "@/components/ui/badge"
import {
  PRODUCTION_JOB_STATUS_LABELS,
  ProductionJobStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<ProductionJobStatus, StatusBadgeStyle> = {
  [ProductionJobStatus.PENDING]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  [ProductionJobStatus.IN_PROGRESS]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
}

type ProductionJobStatusBadgeProps = {
  status: ProductionJobStatus
  className?: string
}

export function ProductionJobStatusBadge({
  status,
  className,
}: ProductionJobStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {PRODUCTION_JOB_STATUS_LABELS[status]}
    </Badge>
  )
}
