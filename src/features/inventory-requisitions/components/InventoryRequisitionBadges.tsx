import { Badge } from "@/components/ui/badge"
import type { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import { inventoryRequisitionStatusLabels } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const inventoryRequisitionStatusStyles: Record<
  InventoryRequisitionStatus,
  BadgeStyle
> = {
  DRAFT: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  PENDING_APPROVAL: {
    badge: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  APPROVED: {
    badge: "bg-info/10 text-info",
    dot: "bg-info",
  },
  ISSUED: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  REJECTED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type InventoryRequisitionStatusBadgeProps = {
  status: InventoryRequisitionStatus
  className?: string
}

export function InventoryRequisitionStatusBadge({
  status,
  className,
}: InventoryRequisitionStatusBadgeProps) {
  const { badge, dot } = inventoryRequisitionStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {inventoryRequisitionStatusLabels[status]}
    </Badge>
  )
}
