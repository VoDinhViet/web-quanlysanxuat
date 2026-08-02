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
    },
  },
})

const PRODUCTION_JOB_STATUS_DOT_CLASSNAME: Record<ProductionJobStatus, string> =
  {
    [ProductionJobStatus.PENDING]: "bg-muted-foreground/50",
    [ProductionJobStatus.IN_PROGRESS]: "bg-blue-500 dark:bg-blue-400",
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
