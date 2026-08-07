import { Badge } from "@/components/ui/badge"
import {
  INVENTORY_STATUS_LABELS,
  InventoryStatus,
} from "@/lib/types/inventory-material.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<InventoryStatus, StatusBadgeStyle> = {
  [InventoryStatus.NORMAL]: {
    badge: "border-success/20 bg-success/10 text-success",
    dot: "bg-success",
  },
  [InventoryStatus.WARNING]: {
    badge: "border-warning/20 bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  [InventoryStatus.SHORTAGE]: {
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type InventoryMaterialStatusBadgeProps = {
  status: InventoryStatus
  className?: string
}

export function InventoryMaterialStatusBadge({
  status,
  className,
}: InventoryMaterialStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

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
      {INVENTORY_STATUS_LABELS[status]}
    </Badge>
  )
}
