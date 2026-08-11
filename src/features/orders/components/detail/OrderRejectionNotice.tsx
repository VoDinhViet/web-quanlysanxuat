import { DangerTriangle } from "@solar-icons/react"
import { DateTime } from "luxon"

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
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <DangerTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">
          {isRejected ? "Đơn hàng bị từ chối" : "Đơn hàng từng bị từ chối"}
        </p>
        <p className="text-sm text-foreground">{order.rejectionReason}</p>
        {order.rejecter && order.rejectedAt ? (
          <p className="text-xs text-muted-foreground">
            {order.rejecter.username} ·{" "}
            {DateTime.fromISO(order.rejectedAt).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        ) : null}
      </div>
    </div>
  )
}
