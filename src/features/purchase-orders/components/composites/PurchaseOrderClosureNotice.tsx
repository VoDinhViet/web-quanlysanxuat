import { StatusNotice } from "@/components/shared/composites/StatusNotice"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderClosureNoticeProps = {
  purchaseOrder: PurchaseOrderDetail
}

// Neutral tone (not a failure): an early-closed PO is a normal COMPLETED order whose line
// quantities were cut to what was actually received.
export function PurchaseOrderClosureNotice({
  purchaseOrder,
}: PurchaseOrderClosureNoticeProps) {
  if (!purchaseOrder.closedAt) {
    return null
  }

  return (
    <StatusNotice
      tone="neutral"
      title="Đơn mua hàng đã đóng sớm"
      reason={
        purchaseOrder.closureReason ??
        "Số lượng từng dòng đã được chốt theo số thực nhập."
      }
      actorName={purchaseOrder.closerBy?.fullName}
      timestamp={purchaseOrder.closedAt}
    />
  )
}
