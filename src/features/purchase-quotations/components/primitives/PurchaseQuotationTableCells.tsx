import { Eye, Pencil, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { DeleteQuotationDialog } from "@/features/purchase-quotations/components/composites/DeleteQuotationDialog"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationRow } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationActionsCellProps = {
  row: PurchaseQuotationRow
}

export function PurchaseQuotationActionsCell({
  row,
}: PurchaseQuotationActionsCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/purchase-quotations/$purchaseQuotationId"
              params={{ purchaseQuotationId: row.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="bg-background text-muted-foreground hover:border-primary/30 hover:text-primary"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>

      {row.status === PurchaseQuotationStatus.DRAFT && (
        <RoutePermissionGate route="/manage/purchase-quotations/$purchaseQuotationId/update">
          <Tooltip>
            <TooltipTrigger
              render={
                <LinkButton
                  to="/manage/purchase-quotations/$purchaseQuotationId/update"
                  params={{ purchaseQuotationId: row.id }}
                  variant="outline"
                  size="icon-sm"
                  aria-label="Sửa báo giá"
                  className="bg-background text-muted-foreground hover:border-primary/30 hover:text-primary"
                >
                  <Pencil className="size-3.5" />
                </LinkButton>
              }
            />
            <TooltipContent>Sửa báo giá</TooltipContent>
          </Tooltip>
        </RoutePermissionGate>
      )}

      {row.status === PurchaseQuotationStatus.DRAFT && (
        <PermissionGate permission="purchasing:delete">
          <Tooltip>
            <DeleteQuotationDialog
              purchaseQuotation={row}
              trigger={
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Xoá báo giá"
                      className="bg-background text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Xoá báo giá</TooltipContent>
          </Tooltip>
        </PermissionGate>
      )}
    </div>
  )
}

