import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { OutsourcingOrderStatus } from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderDetail } from "@/lib/types/outsourcing-order.type"

type OutsourcingOrderRejectionNoticeProps = {
  order: OutsourcingOrderDetail
}

// Chỉ hiện khi phiếu còn REJECTED; sau khi gửi duyệt lại dải này biến mất vì BE xoá lý do.
export function OutsourcingOrderRejectionNotice({
  order,
}: OutsourcingOrderRejectionNoticeProps) {
  if (
    order.status !== OutsourcingOrderStatus.REJECTED ||
    !order.rejectionReason
  ) {
    return null
  }

  return (
    <StatusNotice
      title="Phiếu gia công ngoài bị từ chối"
      reason={order.rejectionReason}
      actorName={order.rejecterBy?.fullName}
      timestamp={order.rejectedAt}
      extra={
        <p className="text-xs text-muted-foreground">
          Người lập sửa lại phiếu rồi gửi duyệt lại.
        </p>
      }
    />
  )
}
