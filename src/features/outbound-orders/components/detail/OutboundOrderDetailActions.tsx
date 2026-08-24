import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { OutboundOrderConfirmDialog } from "@/features/outbound-orders/components/detail/OutboundOrderConfirmDialog"
import { OutboundOrderDeliverDialog } from "@/features/outbound-orders/components/detail/OutboundOrderDeliverDialog"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  order: OutboundOrderDetail
}

// BE outbound-orders có 2 route chuyển trạng thái: POST :id/confirm (DRAFT → PENDING_DELIVERY,
// gate OQC E205) và POST :id/deliver (PENDING_DELIVERY → DELIVERED, tự trừ tồn + đóng đơn) — không
// có duyệt/hủy/in phiếu, xem docs/domains/inventory.md mục "Giao hàng". "Xác nhận DO"/"Xác nhận đã
// giao" bên dưới gọi 2 route đó, gated bằng cùng permission thật (outbound:update) mà cả hai route
// đòi. Hai nút còn lại vẫn PendingAction vì BE thật sự chưa có endpoint.
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

      {status === OutboundOrderStatus.DRAFT && (
        <>
          <PermissionGate permission="outbound:update">
            <OutboundOrderConfirmDialog
              order={order}
              trigger={
                <Button type="button">
                  <CheckCircle className="size-4" />
                  Xác nhận DO
                </Button>
              }
            />
          </PermissionGate>

          <PendingAction label="Hủy đơn DO" hint="chưa có tính năng hủy DO">
            <CloseCircle className="size-4" />
            Hủy đơn DO
          </PendingAction>
        </>
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
