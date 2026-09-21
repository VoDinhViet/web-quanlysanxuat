import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"
import type { TimelineStep } from "@/lib/types/timeline.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — mirror
// purchase-quotation-timeline.ts's reasoning. Unlike RFQ (which always sends → then may reject,
// never skipping a step), a PO can be cancelled either before or after being confirmed
// (DRAFT → CANCELLED, or ORDERED → CANCELLED), so a CANCELLED order's "Xác nhận đặt hàng" step
// only appears when it actually happened (`orderedAt !== null`) — showing it unconditionally
// would claim a step that never occurred.
export function buildPurchaseOrderTimeline(
  purchaseOrder: PurchaseOrderDetail
): TimelineStep[] {
  const creatorName = purchaseOrder.creatorBy?.fullName ?? "Hệ thống"
  const createdStep: TimelineStep = {
    key: "created",
    label: "Tạo đơn mua hàng",
    state: "done",
    timestamp: purchaseOrder.createdAt,
    actor: creatorName,
    detail: null,
  }

  if (purchaseOrder.status === PurchaseOrderStatus.CANCELLED) {
    const cancelledStep: TimelineStep = {
      key: "cancelled",
      label: "Huỷ PO",
      state: "cancelled",
      timestamp: purchaseOrder.cancelledAt,
      actor: purchaseOrder.cancellerBy?.fullName ?? null,
      detail: purchaseOrder.cancellationReason,
    }

    if (purchaseOrder.orderedAt === null) {
      return [createdStep, cancelledStep]
    }

    return [
      createdStep,
      {
        key: "confirmed",
        label: "Xác nhận đặt hàng",
        state: "done",
        timestamp: purchaseOrder.orderedAt,
        actor: purchaseOrder.ordererBy?.fullName ?? null,
        detail: null,
      },
      cancelledStep,
    ]
  }

  const isOrdered = purchaseOrder.status === PurchaseOrderStatus.ORDERED

  return [
    createdStep,
    {
      key: "confirmed",
      label: "Xác nhận đặt hàng",
      state: isOrdered ? "done" : "current",
      timestamp: isOrdered ? purchaseOrder.orderedAt : null,
      actor: isOrdered ? (purchaseOrder.ordererBy?.fullName ?? null) : null,
      detail: null,
    },
  ]
}
