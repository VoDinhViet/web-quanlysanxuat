import { DateTime } from "luxon"
import { TriangleAlert } from "lucide-react"

import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"
import type { PurchaseRequestDetail } from "@/lib/types/purchase-request.type"

type PurchaseRequestRejectionNoticeProps = {
  detail: PurchaseRequestDetail
}

// Mirrors OrderRejectionNotice.tsx, but the status gate differs: rejecting an order sends it
// straight back to DRAFT, so that notice only checks `status === DRAFT`. Rejecting a purchase
// request lands on a distinct terminal REJECTED, and only an item edit/delete flips it back to
// DRAFT (see docs/domains/purchase-requests.md) — so this notice stays visible through both
// REJECTED and the reopened-but-not-yet-resent DRAFT. Once resent (PENDING_APPROVAL) or approved,
// `rejectionReason` is stale history the backend never clears, so it's hidden past that point.
export function PurchaseRequestRejectionNotice({
  detail,
}: PurchaseRequestRejectionNoticeProps) {
  const isUnresolved =
    detail.status === PurchaseRequestStatus.REJECTED ||
    detail.status === PurchaseRequestStatus.DRAFT

  if (!isUnresolved || !detail.rejectionReason) {
    return null
  }

  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">
          Đề xuất bị từ chối
        </p>
        <p className="text-sm text-foreground">{detail.rejectionReason}</p>
        {detail.rejecterBy && detail.rejectedAt ? (
          <p className="text-xs text-muted-foreground">
            {detail.rejecterBy.fullName} ·{" "}
            {DateTime.fromISO(detail.rejectedAt).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        ) : null}
        {detail.status === PurchaseRequestStatus.REJECTED ? (
          <p className="text-xs text-muted-foreground">
            Sửa hoặc xóa một dòng vật tư bên dưới để đưa đề xuất về trạng thái
            Nháp và gửi duyệt lại.
          </p>
        ) : null}
      </div>
    </div>
  )
}
