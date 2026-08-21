import { Badge } from "@/components/ui/badge"
import type { MaterialIssueStatus } from "@/lib/types/material-issue.type"
import { materialIssueStatusLabels } from "@/lib/types/material-issue.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const materialIssueStatusStyles: Record<
  MaterialIssueStatus,
  BadgeStyle
> = {
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
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type MaterialIssueStatusBadgeProps = {
  status: MaterialIssueStatus
  className?: string
}

export function MaterialIssueStatusBadge({
  status,
  className,
}: MaterialIssueStatusBadgeProps) {
  const { badge, dot } = materialIssueStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {materialIssueStatusLabels[status]}
    </Badge>
  )
}
