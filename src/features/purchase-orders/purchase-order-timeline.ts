import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"
import type {
  PurchaseOrderDetail,
  PurchaseOrderTimelineStep,
} from "@/lib/types/purchase-order.type"

// Every step's state derives from `status`, never from a timestamp's mere presence — mirror
// purchase-quotation-timeline.ts's reasoning. Unlike RFQ (which always sends → then may reject,
// never skipping a step), a PO can be cancelled either before or after being confirmed
// (DRAFT → CANCELLED, or ORDERED → CANCELLED), so a CANCELLED order's "Xác nhận đặt hàng" step
// only appears when it actually happened (`orderedAt !== null`) — showing it unconditionally
// would claim a step that never occurred.
export function buildPurchaseOrderTimeline(
  detail: PurchaseOrderDetail
): PurchaseOrderTimelineStep[] {
  const creatorName = detail.creatorBy?.fullName ?? "Hệ thống"
  const createdStep: PurchaseOrderTimelineStep = {
    key: "created",
    label: "Tạo đơn mua hàng",
    state: "done",
    timestamp: detail.createdAt,
    actor: creatorName,
    detail: null,
  }

  if (detail.status === PurchaseOrderStatus.CANCELLED) {
    const cancelledStep: PurchaseOrderTimelineStep = {
      key: "cancelled",
      label: "Huỷ PO",
      state: "cancelled",
      timestamp: detail.cancelledAt,
      actor: detail.cancellerBy?.fullName ?? null,
      detail: detail.cancellationReason,
    }

    if (detail.orderedAt === null) {
      return [createdStep, cancelledStep]
    }

    return [
      createdStep,
      {
        key: "confirmed",
        label: "Xác nhận đặt hàng",
        state: "done",
        timestamp: detail.orderedAt,
        actor: detail.ordererBy?.fullName ?? null,
        detail: null,
      },
      cancelledStep,
    ]
  }

  const isOrdered = detail.status === PurchaseOrderStatus.ORDERED

  return [
    createdStep,
    {
      key: "confirmed",
      label: "Xác nhận đặt hàng",
      state: isOrdered ? "done" : "current",
      timestamp: isOrdered ? detail.orderedAt : null,
      actor: isOrdered ? (detail.ordererBy?.fullName ?? null) : null,
      detail: null,
    },
  ]
}
