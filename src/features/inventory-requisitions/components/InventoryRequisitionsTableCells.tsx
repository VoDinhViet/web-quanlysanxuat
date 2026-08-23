import { CircleX, Pencil, Printer, Trash2 } from "lucide-react"

import { DisabledAction } from "@/components/shared/buttons/DisabledAction"
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

// Chưa có route/API cho bất kỳ thao tác nào ở màn này — mọi nút đều là DisabledAction, hiện/ẩn
// theo trạng thái đúng guard backend (ensureRequisitionDraftOrRejected/E224,
// cancelInventoryRequisition/E224): Sửa/Xoá chỉ ở Nháp/Từ chối, Huỷ ở mọi trạng thái trừ
// Đã xuất/Đã hủy, In phiếu luôn hiện.
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
    <div className="flex items-center justify-center gap-1.5">
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
    </div>
  )
}
