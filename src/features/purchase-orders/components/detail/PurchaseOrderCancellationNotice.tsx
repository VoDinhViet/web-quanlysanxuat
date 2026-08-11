import { DateTime } from "luxon"
import { TriangleAlert } from "lucide-react"

import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCancellationNoticeProps = {
  detail: PurchaseOrderDetail
}

// Mirrors PurchaseQuotationRejectionNotice.tsx. CANCELLED is terminal here too — no route
// accepts it back — so this only ever needs to gate on `status === CANCELLED`.
export function PurchaseOrderCancellationNotice({
  detail,
}: PurchaseOrderCancellationNoticeProps) {
  if (
    detail.status !== PurchaseOrderStatus.CANCELLED ||
    !detail.cancellationReason
  ) {
    return null
  }

  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">
          Đơn mua hàng đã bị huỷ
        </p>
        <p className="text-sm text-foreground">{detail.cancellationReason}</p>
        {detail.cancellerBy && detail.cancelledAt ? (
          <p className="text-xs text-muted-foreground">
            {detail.cancellerBy.fullName} ·{" "}
            {DateTime.fromISO(detail.cancelledAt).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        ) : null}
      </div>
    </div>
  )
}
