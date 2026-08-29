import { Route } from "@solar-icons/react"

import { TimelineCard } from "@/components/shared/composites/TimelineCard"
import { buildOrderTimeline } from "@/features/orders/logic/order-timeline"
import type { OrderDetail } from "@/lib/types/order.type"

type OrderDetailTimelineCardProps = {
  order: OrderDetail
}

// The one deliberate visual anchor of the page — every other section stays
// quiet. Every node and timestamp comes straight from the order's real
// approval fields (order-timeline.ts) — no mock data. `text-primary` note
// tone: this domain's rejection note reads as a clarifying remark, not the
// destructive-red used by purchase-orders/purchase-quotations.
export function OrderDetailTimelineCard({
  order,
}: OrderDetailTimelineCardProps) {
  return (
    <TimelineCard
      icon={Route}
      title="Quy trình đơn hàng"
      steps={buildOrderTimeline(order)}
      noteToneClassName="text-primary"
      className="h-fit"
    />
  )
}
