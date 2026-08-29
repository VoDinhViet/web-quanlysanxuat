import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type BadgeStyle = {
  badge: string
  dot: string
}

type StatusBadgeProps = {
  style: BadgeStyle
  label: string
  className?: string
}

// The shell every status/progress badge in the repo reuses: an outlined Badge with a leading
// dot in the domain's own tone. Each domain keeps its own `Record<XStatus, BadgeStyle>` —
// which status counts as "warning" vs "success" is a product decision, not shell concern — and
// a thin `<X>StatusBadge` wrapper that looks the entity's status up in it. See
// InventoryRequisitionBadges.tsx.
export function StatusBadge({ style, label, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(style.badge, className)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {label}
    </Badge>
  )
}
