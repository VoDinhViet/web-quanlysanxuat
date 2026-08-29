import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestRejectionNoticeProps = {
  purchaseRequest: PurchaseRequestDetail
}

// Mirrors OrderRejectionNotice.tsx, but the status gate differs: rejecting an order sends it
// straight back to DRAFT, so that notice only checks `status === DRAFT`. Rejecting a purchase
// request lands on a distinct terminal REJECTED, and only an item edit/delete flips it back to
// DRAFT (see docs/domains/purchase-requests.md) — so this notice stays visible through both
// REJECTED and the reopened-but-not-yet-resent DRAFT. Once resent (PENDING_APPROVAL) or approved,
// `rejectionReason` is stale history the backend never clears, so it's hidden past that point.
export function PurchaseRequestRejectionNotice({
  purchaseRequest,
}: PurchaseRequestRejectionNoticeProps) {
  const isUnresolved =
    purchaseRequest.status === PurchaseRequestStatus.REJECTED ||
    purchaseRequest.status === PurchaseRequestStatus.DRAFT

  if (!isUnresolved || !purchaseRequest.rejectionReason) {
    return null
  }

  return (
    <StatusNotice
      title="Đề xuất bị từ chối"
      reason={purchaseRequest.rejectionReason}
      actorName={purchaseRequest.rejecterBy?.fullName}
      timestamp={purchaseRequest.rejectedAt}
      extra={
        purchaseRequest.status === PurchaseRequestStatus.REJECTED ? (
          <p className="text-xs text-muted-foreground">
            Sửa hoặc xóa một dòng vật tư bên dưới để đưa đề xuất về trạng thái
            Nháp và gửi duyệt lại.
          </p>
        ) : null
      }
    />
  )
}
