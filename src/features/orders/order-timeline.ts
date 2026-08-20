import { OrderStatus } from "@/lib/types/order.type"
import type { OrderDetail, OrderTimelineStep } from "@/lib/types/order.type"

// Every timestamp/actor here comes straight off `order` — no invented data. A step with
// no backing field on OrderDetail (submit, start-production) shows no timestamp at all
// rather than a guessed one. See OrderStatus's doc comment for the lifecycle this mirrors.
export function buildOrderTimeline(order: OrderDetail): OrderTimelineStep[] {
  const creatorName = order.creatorBy?.fullName ?? "Hệ thống"

  if (order.status === OrderStatus.CANCELLED) {
    return [
      {
        key: "created",
        label: "Tạo đơn hàng",
        state: "done",
        timestamp: order.createdAt,
        actor: creatorName,
        detail: null,
      },
      {
        key: "cancelled",
        label: "Đơn hàng đã hủy",
        state: "cancelled",
        timestamp: order.updatedAt,
        actor: null,
        detail: null,
      },
    ]
  }

  // A reject sends the order to REJECTED; editing it without changing `status` reverts it to
  // DRAFT (keeping `rejectedAt` as history) — either status with `rejectedAt` set means
  // "was rejected", current or past.
  const isRejected =
    (order.status === OrderStatus.REJECTED ||
      order.status === OrderStatus.DRAFT) &&
    order.rejectedAt !== null
  const isApproved = order.approvedAt !== null
  const isProducing = order.status === OrderStatus.IN_PROGRESS
  const isCompleted = order.status === OrderStatus.COMPLETED

  const steps: OrderTimelineStep[] = [
    {
      key: "created",
      label: "Tạo đơn hàng",
      state: "done",
      timestamp: order.createdAt,
      actor: creatorName,
      detail: null,
    },
    {
      key: "submitted",
      label: "Gửi duyệt",
      state:
        order.status !== OrderStatus.DRAFT || isRejected ? "done" : "current",
      timestamp: null,
      actor: null,
      detail: null,
    },
  ]

  if (isRejected) {
    steps.push({
      key: "rejected",
      label: "Bị từ chối",
      state: "cancelled",
      timestamp: order.rejectedAt,
      actor: order.rejecterBy?.fullName ?? null,
      detail: order.rejectionReason,
    })
  }

  steps.push(
    {
      key: "approved",
      label: "Duyệt đơn hàng",
      state: isApproved
        ? "done"
        : order.status === OrderStatus.PENDING_CONFIRMATION
          ? "current"
          : "upcoming",
      timestamp: order.approvedAt,
      actor: order.approverBy?.fullName ?? null,
      detail: null,
    },
    {
      key: "production",
      label: "Sản xuất",
      state: isCompleted ? "done" : isProducing ? "current" : "upcoming",
      timestamp: null,
      actor: null,
      detail: null,
    },
    {
      key: "completed",
      label: "Hoàn thành đơn hàng",
      state: isCompleted ? "done" : "upcoming",
      timestamp: isCompleted ? order.updatedAt : null,
      actor: null,
      detail: null,
    }
  )

  return steps
}
