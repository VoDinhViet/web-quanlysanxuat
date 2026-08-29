import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"
import type { TimelineStep } from "@/lib/types/timeline.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — same
// reasoning as purchase-order-timeline.ts. A payment request only ever leaves PENDING once,
// into either PAID or CANCELLED, so at most 2 steps are ever shown. `detail` stays null on
// every step — PaymentRequestStatusHistoryCard's "dot" variant never renders a note row.
export function buildPaymentRequestTimeline(
  detail: PaymentRequestDetail
): TimelineStep[] {
  const createdStep: TimelineStep = {
    key: "created",
    label: "Tạo yêu cầu thanh toán",
    state: "done",
    timestamp: detail.createdAt,
    actor: detail.createdBy?.fullName ?? "Hệ thống",
    detail: null,
  }

  const secondStep: TimelineStep =
    detail.status === PaymentRequestStatus.PAID
      ? {
          key: "paid",
          label: "Đã thanh toán",
          state: "done",
          timestamp: detail.paidAt,
          actor: detail.paidBy?.fullName ?? null,
          detail: null,
        }
      : detail.status === PaymentRequestStatus.CANCELLED
        ? {
            key: "cancelled",
            label: "Đã hủy",
            state: "cancelled",
            timestamp: detail.cancelledAt,
            actor: detail.cancelledBy?.fullName ?? null,
            detail: null,
          }
        : {
            key: "pending",
            label: "Chờ thanh toán",
            state: "current",
            timestamp: null,
            actor: null,
            detail: null,
          }

  return [createdStep, secondStep]
}
