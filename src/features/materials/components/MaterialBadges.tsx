import { Badge } from "@/components/ui/badge"
import { itemStatusLabels, ItemStatus } from "@/lib/types/item.type"
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

type MaterialStatusBadgeProps = {
  status: ItemStatus
  className?: string
}

export function MaterialStatusBadge({
  status,
  className,
}: MaterialStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {itemStatusLabels[status]}
    </Badge>
  )
}
