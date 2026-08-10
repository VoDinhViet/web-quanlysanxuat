import { Badge } from "@/components/ui/badge"
import { bomItemTypeLabels } from "@/lib/types/bom-item.type"
import type { BomItemType } from "@/lib/types/bom-item.type"
import {
  itemStatusLabels,
  ItemStatus,
  ItemType,
  itemTypeLabels,
} from "@/lib/types/item.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<ItemStatus, StatusBadgeStyle> = {
  [ItemStatus.ACTIVE]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [ItemStatus.INACTIVE]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
}

type ProductStatusBadgeProps = {
  status: ItemStatus
  className?: string
}

export function ProductStatusBadge({
  status,
  className,
}: ProductStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {itemStatusLabels[status]}
    </Badge>
  )
}

const typeStyles: Record<ItemType, string> = {
  [ItemType.FG]: "bg-primary/10 text-primary",
  [ItemType.WIP]: "bg-warning/10 text-warning",
}

type ProductTypeBadgeProps = {
  type: ItemType
  className?: string
}

export function ProductTypeBadge({ type, className }: ProductTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn(typeStyles[type], className)}>
      {itemTypeLabels[type]}
    </Badge>
  )
}

const bomNodeTypeStyles: Record<BomItemType, string> = {
  WIP: "bg-warning/10 text-warning",
  RM: "bg-info/10 text-info",
}

type BomNodeTypeBadgeProps = {
  type: BomItemType
  className?: string
}

// Distinguishes a WIP sub-assembly node from an RM material leaf in the BOM
// tree — both node types render in the same table now that RM leaves live
// directly in bom_items (see docs/decisions/items-merge.md on the backend).
export function BomNodeTypeBadge({ type, className }: BomNodeTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn(bomNodeTypeStyles[type], className)}>
      {bomItemTypeLabels[type]}
    </Badge>
  )
}
