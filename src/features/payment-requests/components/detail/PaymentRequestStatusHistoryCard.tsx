import { History } from "lucide-react"

import { TimelineCard } from "@/components/shared/composites/TimelineCard"
import { buildPaymentRequestTimeline } from "@/features/payment-requests/logic/payment-request-timeline"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestStatusHistoryCardProps = {
  detail: PaymentRequestDetail
}

// Vertical timeline sidebar card, driven by buildPaymentRequestTimeline(). Uses the "dot"
// variant — smaller nodes, denser spacing, no note row — same idiom as the "circle" variant
// used by PurchaseOrderDetailTimelineCard.tsx and friends.
export function PaymentRequestStatusHistoryCard({
  detail,
}: PaymentRequestStatusHistoryCardProps) {
  return (
    <TimelineCard
      icon={History}
      title="Lịch sử trạng thái"
      steps={buildPaymentRequestTimeline(detail)}
      variant="dot"
    />
  )
}
