import { Eye, Pencil } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
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
    </div>
  )
}

