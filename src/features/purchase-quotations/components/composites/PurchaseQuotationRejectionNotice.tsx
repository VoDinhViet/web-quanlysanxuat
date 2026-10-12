import { DateTime } from "luxon"
import { TriangleAlert } from "lucide-react"

import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationRejectionNoticeProps = {
  purchaseQuotation: PurchaseQuotationDetail
}

// Mirrors PurchaseRequestRejectionNotice.tsx. REJECTED and CANCELLED are terminal statuses here
// (no route accepts them back) — unlike purchase-requests' REJECTED, there's no "resend" path, so
// this only ever needs to gate on the status itself, no DRAFT-carryover case.
export function PurchaseQuotationRejectionNotice({
  purchaseQuotation,
}: PurchaseQuotationRejectionNoticeProps) {
  if (
    (purchaseQuotation.status !== PurchaseQuotationStatus.REJECTED &&
      purchaseQuotation.status !== PurchaseQuotationStatus.CANCELLED) ||
    !purchaseQuotation.cancellationReason
  ) {
    return null
  }

  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-destructive">
          {purchaseQuotation.status === PurchaseQuotationStatus.CANCELLED
            ? "Báo giá đã bị huỷ"
            : "Báo giá không được duyệt"}
        </p>
        <p className="text-sm text-foreground">
          {purchaseQuotation.cancellationReason}
        </p>
        {purchaseQuotation.cancellerBy && purchaseQuotation.cancelledAt ? (
          <p className="text-xs text-muted-foreground">
            {purchaseQuotation.cancellerBy.fullName} ·{" "}
            {DateTime.fromISO(purchaseQuotation.cancelledAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}
