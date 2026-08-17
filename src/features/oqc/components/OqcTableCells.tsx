import { Link } from "@tanstack/react-router"
import { Eye } from "lucide-react"

import { IconButton } from "@/components/shared/buttons/IconButton"

type OqcActionsCellProps = {
  oqcId: string
}

export function OqcActionsCell({ oqcId }: OqcActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <IconButton
        label="Xem chi tiết"
        asChild
        className="text-muted-foreground hover:border-primary/30 hover:text-primary"
      >
        <Link to="/manage/oqc/$oqcId" params={{ oqcId }}>
          <Eye className="size-3.5" />
        </Link>
      </IconButton>
    </div>
  )
}
