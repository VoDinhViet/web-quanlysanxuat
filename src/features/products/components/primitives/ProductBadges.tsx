import { Box } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Badge } from "@/components/ui/badge"
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
