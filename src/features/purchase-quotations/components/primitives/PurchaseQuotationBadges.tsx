import { Badge } from "@/components/ui/badge"
import {
  purchaseQuotationStatusLabels,
  PurchaseQuotationStatus,
} from "@/lib/types/purchase-quotation.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// Same DRAFT/PENDING_APPROVAL/APPROVED/CANCELLED lifecycle as PurchaseRequestBadges — reuse its
// palette so the two approval flows read consistently across the app. PurchaseQuotationLegend
// also reads this map, to render the dot on its own without a badge.
export const purchaseQuotationStatusStyles: Record<
  PurchaseQuotationStatus,
  BadgeStyle
> = {
  [PurchaseQuotationStatus.DRAFT]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  [PurchaseQuotationStatus.PENDING_APPROVAL]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [PurchaseQuotationStatus.APPROVED]: {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  [PurchaseQuotationStatus.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive dark:bg-destructive/15",
    dot: "bg-destructive",
  },
}

type PurchaseQuotationStatusBadgeProps = {
  status: PurchaseQuotationStatus
  className?: string
}

export function PurchaseQuotationStatusBadge({
  status,
  className,
}: PurchaseQuotationStatusBadgeProps) {
  const { badge, dot } = purchaseQuotationStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseQuotationStatusLabels[status]}
    </Badge>
  )
}
