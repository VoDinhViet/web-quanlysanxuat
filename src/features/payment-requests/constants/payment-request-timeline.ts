import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"
import type { TimelineStep } from "@/lib/types/timeline.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — same
// reasoning as purchase-order-timeline.ts (YCTT cũ ở PENDING từ trước PH-134 không có `sentAt`).
// Luồng: DRAFT → PENDING (đã đề nghị) → PAID; PENDING → REJECTED → PENDING; hủy được trước khi chi.
// `detail` stays null on every step — PaymentRequestStatusHistoryCard's "dot" variant never
// renders a note row.
const SENT_STATUSES: PaymentRequestStatus[] = [
  PaymentRequestStatus.PENDING,
  PaymentRequestStatus.REJECTED,
  PaymentRequestStatus.PAID,
]

function buildOutcomeStep(paymentRequest: PaymentRequestDetail): TimelineStep {
  switch (paymentRequest.status) {
    case PaymentRequestStatus.PAID:
      return {
        key: "paid",
        label: "Đã thanh toán",
        state: "done",
        timestamp: paymentRequest.paidAt,
        actor: paymentRequest.paidBy?.fullName ?? null,
        detail: null,
      }
    case PaymentRequestStatus.CANCELLED:
      return {
        key: "cancelled",
        label: "Đã hủy",
        state: "cancelled",
        timestamp: paymentRequest.cancelledAt,
        actor: paymentRequest.cancelledBy?.fullName ?? null,
        detail: null,
      }
    case PaymentRequestStatus.REJECTED:
      return {
        key: "rejected",
        label: "Bị từ chối thanh toán",
        state: "cancelled",
        timestamp: paymentRequest.rejectedAt,
        actor: paymentRequest.rejectedBy?.fullName ?? null,
        detail: null,
      }
    case PaymentRequestStatus.DRAFT:
      return {
        key: "draft",
        label: "Chờ đề nghị thanh toán",
        state: "current",
        timestamp: null,
        actor: null,
        detail: null,
      }
    default:
      return {
        key: "pending",
        label: "Chờ thanh toán",
        state: "current",
        timestamp: null,
        actor: null,
        detail: null,
      }
  }
}

export function buildPaymentRequestTimeline(
  paymentRequest: PaymentRequestDetail
): TimelineStep[] {
  const createdStep: TimelineStep = {
    key: "created",
    label: "Tạo yêu cầu thanh toán",
    state: "done",
    timestamp: paymentRequest.createdAt,
    actor: paymentRequest.createdBy?.fullName ?? "Hệ thống",
    detail: null,
  }

  // Hiện bước "Đề nghị" khi trạng thái đã qua bước gửi, hoặc khi còn dấu vết gửi (YCTT đã hủy sau
  // khi gửi). YCTT cũ từ trước PH-134 không có `sentAt` nên vẫn dựa vào trạng thái.
  const hasBeenSent =
    SENT_STATUSES.includes(paymentRequest.status) ||
    paymentRequest.sentAt !== null
  const sentStep: TimelineStep[] = hasBeenSent
    ? [
        {
          key: "sent",
          label: "Đề nghị thanh toán",
          state: "done",
          timestamp: paymentRequest.sentAt,
          actor: paymentRequest.sentBy?.fullName ?? null,
          detail: null,
        },
      ]
    : []

  return [createdStep, ...sentStep, buildOutcomeStep(paymentRequest)]
}
