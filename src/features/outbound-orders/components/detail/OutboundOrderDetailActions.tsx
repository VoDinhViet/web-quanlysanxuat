import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/PermissionGate"
import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { OutboundOrderConfirmDialog } from "@/features/outbound-orders/components/detail/OutboundOrderConfirmDialog"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  order: OutboundOrderDetail
}

// BE outbound-orders chỉ có đúng một route chuyển trạng thái: POST :id/confirm (DRAFT →
// PENDING_DELIVERY, gate OQC E205) — không có duyệt/xác nhận giao thật/hủy/in phiếu, xem
// docs/domains/inventory.md mục "Giao hàng". "Xác nhận DO" bên dưới gọi route đó, gated bằng
// permission thật (outbound:update) mà route đòi. Ba nút còn lại vẫn PendingAction vì BE thật sự
// chưa có endpoint — không phải chỗ nào cũng ghép được.
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
        <PendingAction
          label="Xác nhận đã giao"
          hint="chưa có tính năng xác nhận giao hàng"
        >
          <CheckCircle className="size-4" />
          Xác nhận đã giao
        </PendingAction>
      )}
    </div>
  )
}
