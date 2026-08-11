import { Badge } from "@/components/ui/badge"
import {
  purchaseOrderProgressLabels,
  purchaseOrderStatusLabels,
  PurchaseOrderProgress,
  PurchaseOrderStatus,
} from "@/lib/types/purchase-order.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// Raw wire status (3 values, from the real API) — used by the PO detail page. Distinct from
// `purchaseOrderProgressStyles` below (5 values, synthetic, list page mock only): a PO can never
// actually be RECEIVING/COMPLETED on the wire, so this map only ever needs DRAFT/ORDERED/
// CANCELLED. Same DRAFT-dashed/ORDERED-blue tones as the progress map below, for visual
// continuity within this feature; CANCELLED reuses the same destructive tone as everywhere else.
export const purchaseOrderStatusStyles: Record<
  PurchaseOrderStatus,
  BadgeStyle
> = {
  [PurchaseOrderStatus.DRAFT]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [PurchaseOrderStatus.ORDERED]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [PurchaseOrderStatus.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type PurchaseOrderStatusBadgeProps = {
  status: PurchaseOrderStatus
  className?: string
}

export function PurchaseOrderStatusBadge({
  status,
  className,
}: PurchaseOrderStatusBadgeProps) {
  const { badge, dot } = purchaseOrderStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseOrderStatusLabels[status]}
    </Badge>
  )
}

// Same palette idiom as PurchaseLedgerBadges — 5 progress values need more distinct tones than
// the 3 semantic ones (success/warning/destructive) can tell apart. PurchaseOrderLegend also
// reads this map, to render the dot on its own without a badge.
export const purchaseOrderProgressStyles: Record<
  PurchaseOrderProgress,
  BadgeStyle
> = {
  [PurchaseOrderProgress.DRAFT]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [PurchaseOrderProgress.ORDERED]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [PurchaseOrderProgress.RECEIVING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [PurchaseOrderProgress.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [PurchaseOrderProgress.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type PurchaseOrderProgressBadgeProps = {
  progress: PurchaseOrderProgress
  className?: string
}

export function PurchaseOrderProgressBadge({
  progress,
  className,
}: PurchaseOrderProgressBadgeProps) {
  const { badge, dot } = purchaseOrderProgressStyles[progress]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseOrderProgressLabels[progress]}
    </Badge>
  )
}
