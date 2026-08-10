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

// Same palette idiom as PurchaseOrderBadges/PurchaseLedgerBadges. PurchaseQuotationLegend also
// reads this map, to render the dot on its own without a badge.
export const purchaseQuotationStatusStyles: Record<
  PurchaseQuotationStatus,
  BadgeStyle
> = {
  [PurchaseQuotationStatus.DRAFT]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [PurchaseQuotationStatus.SENT]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [PurchaseQuotationStatus.RECEIVED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [PurchaseQuotationStatus.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive",
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
