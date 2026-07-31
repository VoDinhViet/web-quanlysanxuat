import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  OUTSOURCE_STEP_STATUS_LABELS,
  OutsourceStepStatus,
  PRODUCTION_STEP_STATUS_LABELS,
  ProductionStepStatus,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

// Same recipe as ProductionJobBadges.tsx's status badge — dot + tint, keyed to each step's own
// enum (distinct from the Job-level ProductionJobStatus rendered on the header).
const productionStepStatusBadgeVariants = cva("", {
  variants: {
    status: {
      [ProductionStepStatus.NOT_STARTED]: "bg-muted text-muted-foreground",
      [ProductionStepStatus.IN_PROGRESS]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [ProductionStepStatus.DONE]:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  },
})

const PRODUCTION_STEP_STATUS_DOT_CLASSNAME: Record<
  ProductionStepStatus,
  string
> = {
  [ProductionStepStatus.NOT_STARTED]: "bg-muted-foreground/50",
  [ProductionStepStatus.IN_PROGRESS]: "bg-amber-500 dark:bg-amber-400",
  [ProductionStepStatus.DONE]: "bg-emerald-500 dark:bg-emerald-400",
}

export function ProductionStepStatusBadge({
  status,
}: {
  status: ProductionStepStatus
}) {
  return (
    <Badge
      variant="outline"
      className={productionStepStatusBadgeVariants({ status })}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          PRODUCTION_STEP_STATUS_DOT_CLASSNAME[status]
        )}
      />
      {PRODUCTION_STEP_STATUS_LABELS[status]}
    </Badge>
  )
}

const outsourceStepStatusBadgeVariants = cva("", {
  variants: {
    status: {
      [OutsourceStepStatus.NOT_SENT]: "bg-muted text-muted-foreground",
      [OutsourceStepStatus.IN_PROGRESS]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [OutsourceStepStatus.DONE]:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  },
})

const OUTSOURCE_STEP_STATUS_DOT_CLASSNAME: Record<OutsourceStepStatus, string> =
  {
    [OutsourceStepStatus.NOT_SENT]: "bg-muted-foreground/50",
    [OutsourceStepStatus.IN_PROGRESS]: "bg-amber-500 dark:bg-amber-400",
    [OutsourceStepStatus.DONE]: "bg-emerald-500 dark:bg-emerald-400",
  }

export function OutsourceStepStatusBadge({
  status,
}: {
  status: OutsourceStepStatus
}) {
  return (
    <Badge
      variant="outline"
      className={outsourceStepStatusBadgeVariants({ status })}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          OUTSOURCE_STEP_STATUS_DOT_CLASSNAME[status]
        )}
      />
      {OUTSOURCE_STEP_STATUS_LABELS[status]}
    </Badge>
  )
}
