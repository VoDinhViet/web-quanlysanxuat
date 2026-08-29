import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderCancellationNoticeProps = {
  purchaseOrder: PurchaseOrderDetail
}

// Mirrors PurchaseQuotationRejectionNotice.tsx. CANCELLED is terminal here too — no route
// accepts it back — so this only ever needs to gate on `status === CANCELLED`.
export function PurchaseOrderCancellationNotice({
  purchaseOrder,
}: PurchaseOrderCancellationNoticeProps) {
  if (
    purchaseOrder.status !== PurchaseOrderStatus.CANCELLED ||
    !purchaseOrder.cancellationReason
  ) {
    return null
  }

  return (
    <StatusNotice
      title="Đơn mua hàng đã bị huỷ"
      reason={purchaseOrder.cancellationReason}
      actorName={purchaseOrder.cancellerBy?.fullName}
      timestamp={purchaseOrder.cancelledAt}
    />
  )
}
