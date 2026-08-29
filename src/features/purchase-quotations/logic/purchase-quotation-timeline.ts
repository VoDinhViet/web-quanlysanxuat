import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"
import type { TimelineStep } from "@/lib/types/timeline.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — a
// recalled quotation (APPROVED → DRAFT) keeps its old `approvedAt`/`approverBy` as history (the
// backend never clears them), and a re-sent-then-recalled quotation can even keep a stale
// `sentAt` from a previous cycle. Reading `status` as the single source of truth is what keeps
// this timeline honest across a recall.
export function buildQuotationTimeline(
  detail: PurchaseQuotationDetail
): TimelineStep[] {
  const creatorName = detail.creatorBy?.fullName ?? "Hệ thống"

  if (detail.status === PurchaseQuotationStatus.CANCELLED) {
    return [
      {
        key: "created",
        label: "Tạo báo giá",
        state: "done",
        timestamp: detail.createdAt,
        actor: creatorName,
        detail: null,
      },
      {
        key: "sent",
        label: "Gửi duyệt",
        state: "done",
        timestamp: detail.sentAt,
        actor: detail.senderBy?.fullName ?? null,
        detail: null,
      },
      {
        key: "rejected",
        label: "Bị từ chối",
        state: "cancelled",
        timestamp: detail.cancelledAt,
        actor: detail.cancellerBy?.fullName ?? null,
        detail: detail.cancellationReason,
      },
    ]
  }

  const sentDone = detail.status !== PurchaseQuotationStatus.DRAFT
  const isApprovedNow = detail.status === PurchaseQuotationStatus.APPROVED

  return [
    {
      key: "created",
      label: "Tạo báo giá",
      state: "done",
      timestamp: detail.createdAt,
      actor: creatorName,
      detail: null,
    },
    {
      key: "sent",
      label: "Gửi duyệt",
      state: sentDone ? "done" : "current",
      timestamp: sentDone ? detail.sentAt : null,
      actor: sentDone ? (detail.senderBy?.fullName ?? null) : null,
      detail: null,
    },
    {
      key: "approved",
      label: "Duyệt báo giá",
      state: isApprovedNow ? "done" : sentDone ? "current" : "upcoming",
      timestamp: isApprovedNow ? detail.approvedAt : null,
      actor: isApprovedNow ? (detail.approverBy?.fullName ?? null) : null,
      detail: null,
    },
  ]
}
