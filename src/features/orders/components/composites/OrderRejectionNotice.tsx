import { DangerTriangle } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderRejectionNoticeProps = {
  order: OrderDetail
}

// Shown while REJECTED (current state) and while DRAFT after an edit reverted it (history —
// the person editing still needs to read why it was rejected). Once resubmitted
// (PENDING_CONFIRMATION) the old rejectionReason is stale, not current state.
export function OrderRejectionNotice({ order }: OrderRejectionNoticeProps) {
  const isRejected = order.status === OrderStatus.REJECTED
  const isPastRejection = order.status === OrderStatus.DRAFT

  if ((!isRejected && !isPastRejection) || !order.rejectionReason) {
    return null
  }

  return (
    <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
      <DangerTriangle />
      <AlertTitle>
        {isRejected ? "Đơn hàng bị từ chối" : "Đơn hàng từng bị từ chối"}
      </AlertTitle>
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
