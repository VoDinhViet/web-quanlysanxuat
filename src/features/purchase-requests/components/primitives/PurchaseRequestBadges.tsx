import { Badge } from "@/components/ui/badge"
import {
  purchaseRequestStatusLabels,
  PurchaseRequestStatus,
} from "@/lib/types/purchase-request.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<PurchaseRequestStatus, StatusBadgeStyle> = {
  [PurchaseRequestStatus.DRAFT]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  [PurchaseRequestStatus.PENDING_APPROVAL]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [PurchaseRequestStatus.APPROVED]: {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  [PurchaseRequestStatus.REJECTED]: {
    badge: "bg-destructive/10 text-destructive dark:bg-destructive/15",
    dot: "bg-destructive",
  },
}

type PurchaseRequestStatusBadgeProps = {
  status: PurchaseRequestStatus
  className?: string
}

export function PurchaseRequestStatusBadge({
  status,
  className,
}: PurchaseRequestStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseRequestStatusLabels[status]}
    </Badge>
  )
}
