import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  INVENTORY_STATUS_LABELS,
  InventoryStatus,
} from "@/lib/types/inventory-material.type"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 text-[11px] font-medium",
  {
    variants: {
      status: {
        [InventoryStatus.NORMAL]:
          "bg-success/10 text-success border-success/20",
        [InventoryStatus.WARNING]:
          "bg-warning/10 text-warning border-warning/20",
        [InventoryStatus.SHORTAGE]:
          "bg-destructive/10 text-destructive border-destructive/20",
      },
    },
  }
)

const STATUS_DOT_CLASSNAME: Record<InventoryStatus, string> = {
  [InventoryStatus.NORMAL]: "bg-success",
  [InventoryStatus.WARNING]: "bg-warning",
  [InventoryStatus.SHORTAGE]: "bg-destructive",
}

type InventoryMaterialStatusBadgeProps = {
  status: InventoryStatus
  className?: string
}

export function InventoryMaterialStatusBadge({
  status,
  className,
}: InventoryMaterialStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ status }), className)}
    >
      <span
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASSNAME[status])}
      />
      {INVENTORY_STATUS_LABELS[status]}
    </Badge>
  )
}
