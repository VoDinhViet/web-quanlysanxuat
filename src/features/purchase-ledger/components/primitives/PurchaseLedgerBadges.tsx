import { Clock, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  purchaseLedgerStatusLabels,
  purchaseLedgerWarningDescriptions,
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
// can tell apart, so this mirrors OrderBadges' palette (not InventoryDirectStatusBadge's,
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

// Only 2 warnings — refined capsule styling with rich semantic colors
export const purchaseLedgerWarningStyles: Record<
  PurchaseLedgerWarning,
  BadgeStyle
> = {
  [PurchaseLedgerWarning.NO_PO]: {
    badge:
      "border-amber-300/80 bg-amber-50/90 text-amber-800 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20",
    dot: "bg-amber-500",
  },
  [PurchaseLedgerWarning.URGENT]: {
    badge:
      "border-rose-300/80 bg-rose-50/90 text-rose-800 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
    dot: "bg-rose-500",
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
  const { badge } = purchaseLedgerWarningStyles[warning]
  const Icon =
    warning === PurchaseLedgerWarning.URGENT ? Clock : TriangleAlert

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex h-5.5 cursor-help items-center gap-1.25 rounded-full border px-2 text-[11px] font-medium leading-none whitespace-nowrap shadow-2xs transition-colors",
              badge,
              className
            )}
          >
            <Icon className="size-3 shrink-0" />
            <span>{purchaseLedgerWarningLabels[warning]}</span>
          </span>
        }
      />
      <TooltipContent side="top" className="max-w-xs text-xs">
        {purchaseLedgerWarningDescriptions[warning]}
      </TooltipContent>
    </Tooltip>
  )
}
