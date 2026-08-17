import { Badge } from "@/components/ui/badge"
import {
  InventoryDocumentStatus,
  outsourcingReceiptStatusLabels,
} from "@/lib/types/outsourcing-receipt.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const outsourcingReceiptStatusStyles: Record<
  InventoryDocumentStatus,
  BadgeStyle
> = {
  [InventoryDocumentStatus.DRAFT]: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [InventoryDocumentStatus.POSTED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [InventoryDocumentStatus.CANCELLED]: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type OutsourcingReceiptStatusBadgeProps = {
  status: InventoryDocumentStatus
  className?: string
}

export function OutsourcingReceiptStatusBadge({
  status,
  className,
}: OutsourcingReceiptStatusBadgeProps) {
  const { badge, dot } = outsourcingReceiptStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outsourcingReceiptStatusLabels[status]}
    </Badge>
  )
}
