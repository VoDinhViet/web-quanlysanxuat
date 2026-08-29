import { Route } from "@solar-icons/react"

import { TimelineCard } from "@/components/shared/composites/TimelineCard"
import { buildQuotationTimeline } from "@/features/purchase-quotations/logic/purchase-quotation-timeline"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailTimelineCardProps = {
  detail: PurchaseQuotationDetail
}

// Every node/timestamp comes straight off `detail` via buildQuotationTimeline, no invented
// data.
export function PurchaseQuotationDetailTimelineCard({
  detail,
}: PurchaseQuotationDetailTimelineCardProps) {
  return (
    <TimelineCard
      icon={Route}
      title="Quy trình duyệt"
      steps={buildQuotationTimeline(detail)}
    />
  )
}
