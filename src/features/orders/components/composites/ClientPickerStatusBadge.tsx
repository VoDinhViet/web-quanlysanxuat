import { Badge } from "@/components/ui/badge"
import { clientStatusLabels, ClientStatus } from "@/lib/types/client.type"
import { cn } from "@/lib/utils"

type ClientPickerStatusStyle = {
  badge: string
  dot: string
}

const clientPickerStatusStyles: Record<ClientStatus, ClientPickerStatusStyle> =
  {
    [ClientStatus.ACTIVE]: {
      badge: "bg-success/15 text-success",
      dot: "bg-success",
    },
    [ClientStatus.PAUSED]: {
      badge: "bg-warning/15 text-warning",
      dot: "bg-warning",
    },
  }

type ClientPickerStatusBadgeProps = {
  status: ClientStatus
}

export function ClientPickerStatusBadge({
  status,
}: ClientPickerStatusBadgeProps) {
  const { badge, dot } = clientPickerStatusStyles[status]

  return (
    <Badge variant="outline" className={cn("shrink-0", badge)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {clientStatusLabels[status]}
    </Badge>
  )
}
