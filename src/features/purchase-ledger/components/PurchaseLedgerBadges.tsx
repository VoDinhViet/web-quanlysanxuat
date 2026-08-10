import { Badge } from "@/components/ui/badge"
import {
  purchaseLedgerStatusLabels,
  purchaseLedgerWarningLabels,
  PurchaseLedgerStatus,
  PurchaseLedgerWarning,
} from "@/lib/types/purchase-ledger.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// 4 statuses need more distinct tones than the 3 semantic ones (success/warning/destructive)
// can tell apart, so this mirrors OrderBadges' palette (not InventoryMaterialStatusBadge's,
// which only has 3 tones to cover). PurchaseLedgerLegend also reads this map, to render the dot
// on its own without a badge.
export const purchaseLedgerStatusStyles: Record<
  PurchaseLedgerStatus,
  BadgeStyle
> = {
  [PurchaseLedgerStatus.WAITING_TO_PURCHASE]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [PurchaseLedgerStatus.QUOTING]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [PurchaseLedgerStatus.ORDERED]: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  [PurchaseLedgerStatus.COMPLETED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
}

// Only 2 warnings — these do fit the semantic tokens, same idiom as
// InventoryMaterialStatusBadge's WARNING/SHORTAGE.
export const purchaseLedgerWarningStyles: Record<
  PurchaseLedgerWarning,
  BadgeStyle
> = {
  [PurchaseLedgerWarning.NO_PO]: {
    badge: "border-warning/20 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  [PurchaseLedgerWarning.URGENT]: {
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type PurchaseLedgerStatusBadgeProps = {
  status: PurchaseLedgerStatus
  className?: string
}

export function PurchaseLedgerStatusBadge({
  status,
  className,
}: PurchaseLedgerStatusBadgeProps) {
  const { badge, dot } = purchaseLedgerStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseLedgerStatusLabels[status]}
    </Badge>
  )
}

type PurchaseLedgerWarningBadgeProps = {
  warning: PurchaseLedgerWarning
  className?: string
}

export function PurchaseLedgerWarningBadge({
  warning,
  className,
}: PurchaseLedgerWarningBadgeProps) {
  const { badge, dot } = purchaseLedgerWarningStyles[warning]

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium",
        badge,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {purchaseLedgerWarningLabels[warning]}
    </Badge>
  )
}
