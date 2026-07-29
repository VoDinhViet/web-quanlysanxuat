import { Icon } from "@iconify/react"
import dangerTriangleBold from "@iconify-icons/solar/danger-triangle-bold"
import { DateTime } from "luxon"

import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderRejectionNoticeProps = {
  order: OrderDetail
}

// Only meaningful while the order is back at DRAFT after a reject — once it's resubmitted
// (PENDING_CONFIRMATION) the old rejectionReason is stale history, not current state.
export function OrderRejectionNotice({ order }: OrderRejectionNoticeProps) {
  if (order.status !== OrderStatus.DRAFT || !order.rejectionReason) {
    return null
  }

  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <Icon
        icon={dangerTriangleBold}
        className="mt-0.5 size-5 shrink-0 text-destructive"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">
          Đơn hàng bị từ chối
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
