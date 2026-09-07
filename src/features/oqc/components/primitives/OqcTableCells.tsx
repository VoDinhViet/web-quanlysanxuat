import { Eye, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { DeleteOqcDialog } from "@/features/oqc/components/composites/DeleteOqcDialog"
import { OqcStatus } from "@/lib/types/oqc.type"
import type { Oqc } from "@/lib/types/oqc.type"

type OqcActionsCellProps = {
  oqc: Pick<Oqc, "id" | "code" | "status">
}

// "Xoá" chỉ hiện khi còn NOT_INSPECTED (E178 chặn mọi trạng thái khác) — xoá thẳng từ danh sách,
// không bắt phải vào chi tiết mới xoá được. Dùng chung DeleteOqcDialog với OqcDetailActions.tsx.
export function OqcActionsCell({ oqc }: OqcActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/oqc/$oqcId"
              params={{ oqcId: oqc.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>

      {oqc.status === OqcStatus.DRAFT && (
        <PermissionGate permission="oqc:delete">
          <DeleteOqcDialog
            oqc={oqc}
            trigger={
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Xoá phiếu"
                      className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>Xoá phiếu</TooltipContent>
              </Tooltip>
            }
          />
        </PermissionGate>
      )}
    </div>
  )
}
