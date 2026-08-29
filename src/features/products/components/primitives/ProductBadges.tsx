import { Bolt, Box, LayersMinimalistic } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

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

type TypeBadgeStyle = {
  badge: string
  icon: ComponentType<IconProps>
}

const typeStyles: Record<ItemType, TypeBadgeStyle> = {
  [ItemType.FG]: { badge: "bg-primary/10 text-primary", icon: Box },
  [ItemType.WIP]: {
    badge: "bg-warning/10 text-warning",
    icon: LayersMinimalistic,
  },
}

type ProductTypeBadgeProps = {
  type: ItemType
  className?: string
}

export function ProductTypeBadge({ type, className }: ProductTypeBadgeProps) {
  const { badge, icon: Icon } = typeStyles[type]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <Icon />
      {itemTypeLabels[type]}
    </Badge>
  )
}

const bomNodeTypeStyles: Record<BomItemType, TypeBadgeStyle> = {
  WIP: { badge: "bg-warning/10 text-warning", icon: LayersMinimalistic },
  RM: { badge: "bg-info/10 text-info", icon: Bolt },
}

type BomNodeTypeBadgeProps = {
  type: BomItemType
  className?: string
}

// Distinguishes a WIP sub-assembly node from an RM material leaf in the BOM
// tree — both node types render in the same table now that RM leaves live
// directly in bom_items (see docs/decisions/items-merge.md on the backend).
export function BomNodeTypeBadge({ type, className }: BomNodeTypeBadgeProps) {
  const { badge, icon: Icon } = bomNodeTypeStyles[type]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <Icon />
      {bomItemTypeLabels[type]}
    </Badge>
  )
}
