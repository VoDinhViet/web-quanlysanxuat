import {
  CheckCircle,
  CloseCircle,
  PenNewSquare,
  Printer,
  SendSquare,
} from "@solar-icons/react"
import { Link } from "@tanstack/react-router"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { OutboundOrderApproveDialog } from "@/features/outbound-orders/components/detail/OutboundOrderApproveDialog"
import { OutboundOrderCancelDialog } from "@/features/outbound-orders/components/detail/OutboundOrderCancelDialog"
import { OutboundOrderDeliverDialog } from "@/features/outbound-orders/components/detail/OutboundOrderDeliverDialog"
import { OutboundOrderRejectDialog } from "@/features/outbound-orders/components/detail/OutboundOrderRejectDialog"
import { OutboundOrderSendDialog } from "@/features/outbound-orders/components/detail/OutboundOrderSendDialog"
import {
  canUpdateOutboundOrder,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  order: OutboundOrderDetail
}

// BE outbound-orders có 4 route chuyển trạng thái: POST :id/send (DRAFT/REJECTED →
// PENDING_APPROVAL, gate OQC E205), POST :id/approve (PENDING_APPROVAL → PENDING_DELIVERY, cũng
// gate E205), POST :id/reject (PENDING_APPROVAL → REJECTED, lý do bắt buộc) và POST :id/deliver
// (PENDING_DELIVERY → DELIVERED, tự trừ tồn + đóng đơn) — xem docs/domains/inventory.md mục "Giao
// hàng". send/deliver gated bằng outbound:update (người lập/kho), approve/reject bằng
// outbound:approve (Giám đốc). "Sửa"/"Hủy đơn DO" (BUG-090) cũng gated outbound:update — chỉ
// render khi component này render (xem OutboundOrderDetailHeader.tsx, ẩn hẳn khi đang Sửa). "In
// phiếu DO" vẫn PendingAction — BE chưa có tính năng in phiếu, không liên quan BUG-090.
export function OutboundOrderDetailActions({
  order,
}: OutboundOrderDetailActionsProps) {
  const { status } = order

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PendingAction label="In phiếu DO" hint="chưa có tính năng in phiếu">
        <Printer className="size-4" />
        In phiếu DO
      </PendingAction>

      {canUpdateOutboundOrder(status) && (
        <PermissionGate permission="outbound:update">
          <Button variant="outline" asChild>
            <Link
              to="/manage/outbound-orders/$outboundOrderId"
              params={{ outboundOrderId: order.id }}
              search={{ mode: "edit" }}
            >
              <PenNewSquare className="size-4" />
              Sửa
            </Link>
          </Button>
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

      {status === OutboundOrderStatus.PENDING_DELIVERY && (
        <PermissionGate permission="outbound:update">
          <OutboundOrderDeliverDialog
            order={order}
            trigger={
              <Button type="button">
                <CheckCircle className="size-4" />
                Xác nhận đã giao
              </Button>
            }
          />
        </PermissionGate>
      )}
    </div>
  )
}
