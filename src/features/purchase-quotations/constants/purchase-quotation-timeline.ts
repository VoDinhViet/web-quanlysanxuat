import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"
import type { TimelineStep } from "@/lib/types/timeline.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — a
// recalled quotation (APPROVED → DRAFT) keeps its old `approvedAt`/`approverBy` as history (the
// backend never clears them), and a re-sent-then-recalled quotation can even keep a stale
// `sentAt` from a previous cycle. Reading `status` as the single source of truth is what keeps
// this timeline honest across a recall.
export function buildQuotationTimeline(
  purchaseQuotation: PurchaseQuotationDetail
): TimelineStep[] {
  const creatorName = purchaseQuotation.creatorBy?.fullName ?? "Hệ thống"

  if (purchaseQuotation.status === PurchaseQuotationStatus.CANCELLED) {
    return [
      {
        key: "created",
        label: "Tạo báo giá",
        state: "done",
        timestamp: purchaseQuotation.createdAt,
        actor: creatorName,
        detail: null,
      },
      {
        key: "sent",
        label: "Gửi duyệt",
        state: "done",
        timestamp: purchaseQuotation.sentAt,
        actor: purchaseQuotation.senderBy?.fullName ?? null,
        detail: null,
      },
      {
        key: "rejected",
        label: "Bị từ chối",
        state: "cancelled",
        timestamp: purchaseQuotation.cancelledAt,
        actor: purchaseQuotation.cancellerBy?.fullName ?? null,
        detail: purchaseQuotation.cancellationReason,
      },
    ]
  }

  const sentDone = purchaseQuotation.status !== PurchaseQuotationStatus.DRAFT
  const isApprovedNow =
    purchaseQuotation.status === PurchaseQuotationStatus.APPROVED

  return [
    {
      key: "created",
      label: "Tạo báo giá",
      state: "done",
      timestamp: purchaseQuotation.createdAt,
      actor: creatorName,
      detail: null,
    },
    {
      key: "sent",
      label: "Gửi duyệt",
      state: sentDone ? "done" : "current",
      timestamp: sentDone ? purchaseQuotation.sentAt : null,
      actor: sentDone ? (purchaseQuotation.senderBy?.fullName ?? null) : null,
      detail: null,
    },
    {
      key: "approved",
      label: "Duyệt báo giá",
      state: isApprovedNow ? "done" : sentDone ? "current" : "upcoming",
      timestamp: isApprovedNow ? purchaseQuotation.approvedAt : null,
      actor: isApprovedNow
        ? (purchaseQuotation.approverBy?.fullName ?? null)
        : null,
      detail: null,
    },
  ]
}
