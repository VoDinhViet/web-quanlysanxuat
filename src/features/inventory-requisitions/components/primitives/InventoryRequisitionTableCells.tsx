import { Eye, Printer, Trash2 } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { RowActions } from "@/components/shared/primitives/RowActions"
import { DeleteRequisitionDialog } from "@/features/inventory-requisitions/components/composites/DeleteRequisitionDialog"
import { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"
import type {
  InventoryRequisition,
  InventoryRequisitionProductionOrderRef,
} from "@/lib/types/inventory-requisition.type"

type InventoryRequisitionSourceCellProps = {
  productionOrder: InventoryRequisitionProductionOrderRef | null
  reason: string | null
}

// Ưu tiên hiện mã PO (productionOrder.order.code) → lý do tự do → "—", cùng idiom
// InventoryIssueSourceCell.
export function InventoryRequisitionSourceCell({
  productionOrder,
  reason,
}: InventoryRequisitionSourceCellProps) {
  if (productionOrder) {
    return (
      <span className="font-mono text-xs font-semibold text-primary">
        {productionOrder.order.code}
      </span>
    )
  }

  if (reason) {
    return <span className="text-xs text-foreground">{reason}</span>
  }

  return <span className="text-xs text-muted-foreground">—</span>
}

type InventoryRequisitionActionsCellProps = {
  requisition: InventoryRequisition
}

// Nút Xem chi tiết chuyển đến trang chi tiết phiếu.
// Xoá phiếu chỉ khả dụng khi phiếu ở trạng thái Nháp (DRAFT).
export function InventoryRequisitionActionsCell({
  requisition,
}: InventoryRequisitionActionsCellProps) {
  const isDraft = requisition.status === InventoryRequisitionStatus.DRAFT

  return (
    <RowActions>
      <Tooltip>
        <TooltipTrigger
          render={
            <LinkButton
              to="/manage/inventory-requisitions/$requisitionId"
              params={{ requisitionId: requisition.id }}
              variant="outline"
              size="icon-sm"
              aria-label="Xem chi tiết"
              className="bg-background text-muted-foreground"
            >
              <Eye className="size-3.5" />
            </LinkButton>
          }
        />
        <TooltipContent>Xem chi tiết</TooltipContent>
      </Tooltip>

      <DisabledAction label="In phiếu" hint="chưa được xây dựng">
        <Printer className="size-3.5" />
      </DisabledAction>

      {isDraft ? (
        <PermissionGate permission="inventory-requisitions:delete">
          <Tooltip>
            <DeleteRequisitionDialog
              requisition={requisition}
              trigger={
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Xoá phiếu"
                      className="bg-background text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>Xoá phiếu</TooltipContent>
          </Tooltip>
        </PermissionGate>
      ) : (
        <DisabledAction
          label="Xoá phiếu"
          hint="chỉ xoá được khi phiếu ở trạng thái Nháp"
        >
          <Trash2 className="size-3.5" />
        </DisabledAction>
      )}
    </RowActions>
  )
}

