import { Eye } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Ncr } from "@/lib/types/ncr.type"

type NcrActionsCellProps = {
  ncr: Pick<Ncr, "id">
}

// No delete here: the backend has no NCR delete — an NCR is closed or rejected from its detail.
export function NcrActionsCell({ ncr }: NcrActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/ncrs/$ncrId"
              params={{ ncrId: ncr.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="text-muted-foreground hover:border-border hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>
    </div>
  )
}
