import { Badge } from "@/components/ui/badge"
import { USER_STATUS_LABELS } from "@/features/users/types/user.type"
import { cn } from "@/lib/utils"
import type { UserStatus } from "@/features/users/types/user.type"

export function StatusBadge({ status }: { status: UserStatus }) {
  const isActive = status === "ACTIVE"

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 border-transparent px-2 text-[10px] font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-700"
          : "bg-orange-100 text-orange-700"
      )}
    >
      {USER_STATUS_LABELS[status]}
    </Badge>
  )
}
