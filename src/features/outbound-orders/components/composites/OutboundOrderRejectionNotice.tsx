import { DangerTriangle } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OutboundOrderStatus } from "@/lib/types/outbound-order.type"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"

type OutboundOrderRejectionNoticeProps = {
  order: OutboundOrderDetail
}

// DO không có route sửa dòng nên không có nhánh "trả về DRAFT" như OrderRejectionNotice.tsx — chỉ
// hiện khi đang REJECTED, biến mất ngay khi gửi duyệt lại (PENDING_APPROVAL).
export function OutboundOrderRejectionNotice({
  order,
}: OutboundOrderRejectionNoticeProps) {
  if (order.status !== OutboundOrderStatus.REJECTED || !order.rejectionReason) {
    return null
  }

  return (
    <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
      <DangerTriangle />
      <AlertTitle>Phiếu giao hàng bị từ chối</AlertTitle>
      <AlertDescription className="text-foreground">
        {order.rejectionReason}
        {order.rejecterBy && order.rejectedAt ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            {order.rejecterBy.fullName} ·{" "}
            {DateTime.fromISO(order.rejectedAt).toFormat("dd/MM/yyyy HH:mm")}
          </span>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
