import { Badge } from "@/components/ui/badge"
import type { InventoryIssueStatus } from "@/lib/types/inventory-issue.type"
import { inventoryIssueStatusLabels } from "@/lib/types/inventory-issue.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const inventoryIssueStatusStyles: Record<
  InventoryIssueStatus,
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

type InventoryIssueStatusBadgeProps = {
  status: InventoryIssueStatus
  className?: string
}

export function InventoryIssueStatusBadge({
  status,
  className,
}: InventoryIssueStatusBadgeProps) {
  const { badge, dot } = inventoryIssueStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {inventoryIssueStatusLabels[status]}
    </Badge>
  )
}
