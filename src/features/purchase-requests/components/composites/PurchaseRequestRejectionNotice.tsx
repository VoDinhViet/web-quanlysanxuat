import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestRejectionNoticeProps = {
  purchaseRequest: PurchaseRequestDetail
}

// Mirrors OrderRejectionNotice.tsx, but the status gate differs: rejecting an order sends it
// straight back to DRAFT, so that notice only checks `status === DRAFT`. Rejecting a purchase
// request lands on a distinct REJECTED, which can be resent directly, deleted, or flipped back to
// DRAFT by an item edit/delete — so this notice stays visible through both REJECTED and the
// reopened-but-not-yet-resent DRAFT. Once resent (PENDING_APPROVAL) or approved,
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
            Chỉnh sửa vật tư bên dưới rồi bấm "Gửi duyệt lại", hoặc xóa đề xuất
            này.
          </p>
        ) : null
      }
    />
  )
}
