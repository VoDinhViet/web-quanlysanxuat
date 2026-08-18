import { CheckCircle, CloseCircle, Printer } from "@solar-icons/react"
import { SendHorizontal } from "lucide-react"

import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderDetailActionsProps = {
  order: OutboundOrderDetail
}

// BE outbound-orders hiện chỉ có list/detail/items/create (luôn DRAFT, docs/domains/inventory.md
// mục "Giao hàng" — phase 1) — chưa có API duyệt/xác nhận giao/hủy/in phiếu (cũng chưa có
// permission `outbound:update` nào để gate các thao tác này), nên mọi nút chuyển trạng thái + in
// phiếu dùng PendingAction (disabled + tooltip) thay vì mutation mock cũ, không bọc PermissionGate
// vì chưa có permission code đúng cho chúng. Điều kiện hiện nút theo status giữ nguyên để UI đã
// sẵn sàng khi BE thêm API ở phase sau.
export function OutboundOrderDetailActions({
  order,
}: OutboundOrderDetailActionsProps) {
  const isDraft = order.status === OutboundOrderStatus.DRAFT
  const isPendingApproval =
    order.status === OutboundOrderStatus.PENDING_APPROVAL
  const isPendingDelivery =
    order.status === OutboundOrderStatus.PENDING_DELIVERY

  return (
    <div className="flex flex-wrap items-center gap-2">
      <PendingAction label="In phiếu DO" hint="chưa có tính năng in phiếu">
        <Printer className="size-4" />
        In phiếu DO
      </PendingAction>

      {isDraft && (
        <PendingAction label="Gửi duyệt DO" hint="chưa có tính năng duyệt DO">
          <SendHorizontal className="size-4" />
          Gửi duyệt DO
        </PendingAction>
      )}

      {isPendingApproval && (
        <PendingAction label="Duyệt đơn DO" hint="chưa có tính năng duyệt DO">
          <CheckCircle className="size-4" />
          Duyệt đơn DO
        </PendingAction>
      )}

      {isPendingDelivery && (
        <PendingAction
          label="Xác nhận đã giao"
          hint="chưa có tính năng xác nhận giao hàng"
        >
          <CheckCircle className="size-4" />
          Xác nhận đã giao
        </PendingAction>
      )}

      {(isDraft || isPendingApproval) && (
        <PendingAction label="Hủy đơn DO" hint="chưa có tính năng hủy DO">
          <CloseCircle className="size-4" />
          Hủy đơn DO
        </PendingAction>
      )}
    </div>
  )
}
