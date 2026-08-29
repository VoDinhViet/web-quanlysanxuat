import { StatusBadge } from "@/components/shared/primitives/StatusBadge"
import type { BadgeStyle } from "@/components/shared/primitives/StatusBadge"
import type { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import { inventoryRequisitionStatusLabels } from "@/lib/types/inventory-requisition.type"

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
  return (
    <StatusBadge
      style={inventoryRequisitionStatusStyles[status]}
      label={inventoryRequisitionStatusLabels[status]}
      className={className}
    />
  )
}
