import { CircleX, Eye, Pencil, Printer, Trash2 } from "lucide-react"

import { LinkButton } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DisabledAction } from "@/components/shared/primitives/DisabledAction"
import { RowActions } from "@/components/shared/primitives/RowActions"
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

// Nút Xem chi tiết chuyển đến trang chi tiết phiếu. Các thao tác khác hiện/ẩn theo trạng thái
// đúng guard backend: Sửa/Xoá chỉ ở Nháp/Từ chối, Huỷ ở mọi trạng thái trừ Đã xuất/Đã hủy, In phiếu luôn hiện.
export function InventoryRequisitionActionsCell({
  requisition,
}: InventoryRequisitionActionsCellProps) {
  const canEditOrDelete =
    requisition.status === InventoryRequisitionStatus.DRAFT ||
    requisition.status === InventoryRequisitionStatus.REJECTED
  const canCancel =
    requisition.status !== InventoryRequisitionStatus.ISSUED &&
    requisition.status !== InventoryRequisitionStatus.CANCELLED

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

      {canEditOrDelete && (
        <DisabledAction label="Sửa phiếu" hint="chưa được xây dựng">
          <Pencil className="size-3.5" />
        </DisabledAction>
      )}

      {canEditOrDelete && (
        <DisabledAction label="Xoá phiếu" hint="chưa được xây dựng">
          <Trash2 className="size-3.5" />
        </DisabledAction>
      )}

      {canCancel && (
        <DisabledAction label="Huỷ phiếu" hint="chưa được xây dựng">
          <CircleX className="size-3.5" />
        </DisabledAction>
      )}
    </RowActions>
  )
}
