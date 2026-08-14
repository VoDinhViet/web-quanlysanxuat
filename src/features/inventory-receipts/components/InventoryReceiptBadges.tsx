import { Badge } from "@/components/ui/badge"
import type { InventoryReceiptStatus } from "@/lib/types/inventory-receipt.type"
import { inventoryReceiptStatusLabels } from "@/lib/types/inventory-receipt.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const inventoryReceiptStatusStyles: Record<
  InventoryReceiptStatus,
  BadgeStyle
> = {
  DRAFT: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  POSTED: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type InventoryReceiptStatusBadgeProps = {
  status: InventoryReceiptStatus
  className?: string
}

export function InventoryReceiptStatusBadge({
  status,
  className,
}: InventoryReceiptStatusBadgeProps) {
  const { badge, dot } = inventoryReceiptStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {inventoryReceiptStatusLabels[status]}
    </Badge>
  )
}
