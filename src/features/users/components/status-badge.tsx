import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UserStatus } from "@/features/users/types/user.type"

export function StatusBadge({ status }: { status: UserStatus }) {
  const isActive = status === "Hoạt động"

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
      {status}
    </Badge>
  )
}
