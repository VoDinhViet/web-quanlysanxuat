import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type {
  PaymentRequestDetail,
  PaymentRequestTimelineStep,
} from "@/lib/types/payment-request.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — same
// reasoning as purchase-order-timeline.ts. A payment request only ever leaves PENDING once,
// into either PAID or CANCELLED, so at most 2 steps are ever shown.
export function buildPaymentRequestTimeline(
  detail: PaymentRequestDetail
): PaymentRequestTimelineStep[] {
  const createdStep: PaymentRequestTimelineStep = {
    key: "created",
    label: "Tạo yêu cầu thanh toán",
    state: "done",
    timestamp: detail.createdAt,
    actor: detail.createdBy?.fullName ?? "Hệ thống",
  }

  const secondStep: PaymentRequestTimelineStep =
    detail.status === PaymentRequestStatus.PAID
      ? {
          key: "paid",
          label: "Đã thanh toán",
          state: "done",
          timestamp: detail.paidAt,
          actor: detail.paidBy?.fullName ?? null,
        }
      : detail.status === PaymentRequestStatus.CANCELLED
        ? {
            key: "cancelled",
            label: "Đã hủy",
            state: "cancelled",
            timestamp: detail.cancelledAt,
            actor: detail.cancelledBy?.fullName ?? null,
          }
        : {
            key: "pending",
            label: "Chờ thanh toán",
            state: "current",
            timestamp: null,
            actor: null,
          }

  return [createdStep, secondStep]
}
