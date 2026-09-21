import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MockDataBadgeProps = {
  className?: string
}

// Flags a section built from placeholder data (no backend endpoint yet) so
// staff don't mistake it for tracked reality — dashed border sets it apart
// from every real status badge, which is always solid.
export function MockDataBadge({ className }: MockDataBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border border-dashed border-warning/40 bg-warning/5 text-warning",
        className
      )}
    >
      Dữ liệu mẫu
    </Badge>
  )
}
