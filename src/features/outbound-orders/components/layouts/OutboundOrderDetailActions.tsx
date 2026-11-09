import {
  CheckCircle,
  CloseCircle,
  PenNewSquare,
  SendSquare,
} from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button, LinkButton } from "@/components/ui/button"
import { OutboundOrderApproveDialog } from "@/features/outbound-orders/components/composites/OutboundOrderApproveDialog"
import { OutboundOrderCancelDialog } from "@/features/outbound-orders/components/composites/OutboundOrderCancelDialog"
import { OutboundOrderExportActions } from "@/features/outbound-orders/components/layouts/OutboundOrderExportActions"
import { OutboundOrderRejectDialog } from "@/features/outbound-orders/components/composites/OutboundOrderRejectDialog"
import { OutboundOrderSendDialog } from "@/features/outbound-orders/components/composites/OutboundOrderSendDialog"
import {
  canUpdateOutboundOrder,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  order: OutboundOrderDetail
}

// BE outbound-orders có 3 route chuyển trạng thái: POST :id/send (DRAFT/REJECTED →
// PENDING_APPROVAL, gate OQC E205), POST :id/approve (PENDING_APPROVAL → PENDING_DELIVERY, cũng
// gate E205, sinh phiếu xuất kho SALES nháp) và POST :id/reject (PENDING_APPROVAL → REJECTED, lý
// do bắt buộc). Giao xong DO do thủ kho ghi sổ phiếu xuất kho, không còn nút ở đây. send gated
// bằng outbound:update (người lập), approve/reject bằng outbound:approve (Giám đốc).
// "Sửa"/"Hủy đơn DO" (BUG-090) cũng gated outbound:update — chỉ render khi component này render
// (xem OutboundOrderDetailHeader.tsx, ẩn hẳn khi đang Sửa).
export function OutboundOrderDetailActions({
  order,
}: OutboundOrderDetailActionsProps) {
  const { status } = order

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canUpdateOutboundOrder(status) && (
        <PermissionGate permission="outbound:update">
          <LinkButton
            to="/manage/outbound-orders/$outboundOrderId"
            params={{ outboundOrderId: order.id }}
            search={{ mode: "edit" }}
            variant="outline"
          >
            <PenNewSquare className="size-4" />
            Sửa
          </LinkButton>
        </PermissionGate>
      )}

      {(status === OutboundOrderStatus.DRAFT ||
        status === OutboundOrderStatus.REJECTED) && (
        <PermissionGate permission="outbound:update">
          <OutboundOrderSendDialog
            order={order}
            trigger={
              <Button type="button">
                <SendSquare className="size-4" />
                Gửi duyệt DO
              </Button>
            }
          />
        </PermissionGate>
      )}

      {(status === OutboundOrderStatus.DRAFT ||
        status === OutboundOrderStatus.PENDING_APPROVAL ||
        status === OutboundOrderStatus.PENDING_DELIVERY) && (
        <PermissionGate permission="outbound:update">
          <OutboundOrderCancelDialog
            order={order}
            trigger={
              <Button type="button" variant="outline">
                <CloseCircle className="size-4" />
                Hủy đơn DO
              </Button>
            }
          />
        </PermissionGate>
      )}

      {status === OutboundOrderStatus.PENDING_APPROVAL && (
        <PermissionGate permission="outbound:approve">
          <OutboundOrderRejectDialog
            order={order}
            trigger={
              <Button type="button" variant="outline">
                <CloseCircle className="size-4" />
                Từ chối
              </Button>
            }
          />
          <OutboundOrderApproveDialog
            order={order}
            trigger={
              <Button type="button">
                <CheckCircle className="size-4" />
                Duyệt
              </Button>
            }
          />
        </PermissionGate>
      )}

      <OutboundOrderExportActions outboundOrderId={order.id} />
    </div>
  )
}
