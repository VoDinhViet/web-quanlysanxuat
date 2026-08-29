import { Route } from "@solar-icons/react"

import { TimelineCard } from "@/components/shared/composites/TimelineCard"
import { buildPurchaseOrderTimeline } from "@/features/purchase-orders/logic/purchase-order-timeline"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderDetailTimelineCardProps = {
  purchaseOrder: PurchaseOrderDetail
}

// Every node/timestamp comes straight off `purchaseOrder` via buildPurchaseOrderTimeline, no
// invented data.
export function PurchaseOrderDetailTimelineCard({
  purchaseOrder,
}: PurchaseOrderDetailTimelineCardProps) {
  return (
    <TimelineCard
      icon={Route}
      title="Quy trình xử lý"
      steps={buildPurchaseOrderTimeline(purchaseOrder)}
    />
  )
}
