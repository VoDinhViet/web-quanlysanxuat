import { AlertCircle, AlertTriangle, Check, CheckCircle2 } from "lucide-react"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import {
  productionJobStatusLabels,
  productionJobWarningLabels,
  ProductionJobStatus,
  ProductionJobWarning,
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
  [ProductionJobStatus.WAITING_QC]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [ProductionJobStatus.WAITING_DELIVERY]: {
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    dot: "bg-sky-500 dark:bg-sky-400",
  },
  [ProductionJobStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
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
      {productionJobStatusLabels[status]}
    </Badge>
  )
}

export function getProductionJobWarning(job: {
  dueDate: string | null
  status: ProductionJobStatus
}): ProductionJobWarning | null {
  if (job.status === ProductionJobStatus.COMPLETED) {
    return ProductionJobWarning.COMPLETED
  }
  if (!job.dueDate) {
    return null
  }

  const today = DateTime.now().setZone("Asia/Ho_Chi_Minh").startOf("day")
  const due = DateTime.fromISO(job.dueDate)
    .setZone("Asia/Ho_Chi_Minh")
    .startOf("day")
  const diffDays = Math.round(due.diff(today, "days").days)

  if (diffDays < 0) return ProductionJobWarning.OVERDUE
  if (diffDays <= 2) return ProductionJobWarning.URGENT
  if (diffDays <= 7) return ProductionJobWarning.DUE_SOON
  return ProductionJobWarning.NORMAL
}

type WarningBadgeConfig = {
  badge: string
  icon: React.ReactNode
}

const warningStyles: Record<ProductionJobWarning, WarningBadgeConfig> = {
  [ProductionJobWarning.NORMAL]: {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    icon: (
      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  [ProductionJobWarning.DUE_SOON]: {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    icon: (
      <AlertCircle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
    ),
  },
  [ProductionJobWarning.URGENT]: {
    badge:
      "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    icon: (
      <AlertCircle className="size-3.5 shrink-0 text-red-600 dark:text-red-400" />
    ),
  },
  [ProductionJobWarning.OVERDUE]: {
    badge:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
    icon: (
      <AlertTriangle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
    ),
  },
  [ProductionJobWarning.COMPLETED]: {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    icon: (
      <Check className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
    ),
  },
}

type ProductionJobWarningBadgeProps = {
  dueDate: string | null
  status: ProductionJobStatus
  className?: string
}

export function ProductionJobWarningBadge({
  dueDate,
  status,
  className,
}: ProductionJobWarningBadgeProps) {
  const warning = getProductionJobWarning({ dueDate, status })

  if (!warning) {
    return <span className="text-muted-foreground">—</span>
  }

  const { badge, icon } = warningStyles[warning]

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        badge,
        className
      )}
    >
      {icon}
      <span>{productionJobWarningLabels[warning]}</span>
    </Badge>
  )
}
