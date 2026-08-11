import { faker } from "@faker-js/faker"
import { DateTime } from "luxon"

import { roundMoney } from "@/lib/utils"
import { OrderStatus } from "@/lib/types/order.type"
import type {
  OrderDetail,
  OrderMockClientProfile,
  OrderMockDeliveryProgress,
  OrderMockDeliveryRow,
  OrderMockPaymentRow,
  OrderMockPaymentStatus,
} from "@/lib/types/order.type"

// Placeholder data for the order detail page's 3 data-less sections (see the
// matching types in order.type.ts) — same idea as
// src/features/manage/mock/manage-dashboard.mock.ts, but seeded per order
// (via the order's own id) instead of once globally: two different orders
// shouldn't render identical numbers, while the SAME order must render the
// same numbers across re-renders/refetches. Delete this file once the
// backend ships DO tracking and a payments ledger. (The approval timeline
// used to live here too — it's now real data, see order-timeline.ts.)

// DateTime#toISO() types as `string | null` (it only returns null for an
// invalid DateTime) — every caller here builds off an already-valid ISO
// string via .plus(), so the fallback never actually fires.
function toIso(dateTime: DateTime, fallback: string): string {
  return dateTime.toISO() ?? fallback
}

function seedFor(order: OrderDetail): void {
  let hash = 0
  for (let index = 0; index < order.id.length; index++) {
    hash = (hash * 31 + order.id.charCodeAt(index)) | 0
  }
  faker.seed(Math.abs(hash))
}

// Share of the order considered "delivered" so far — a stand-in for real DO
// tracking. Nothing ships before production starts; a cancelled order never
// ships at all.
const DELIVERED_PERCENT_BY_STATUS: Record<OrderStatus, number> = {
  [OrderStatus.DRAFT]: 0,
  [OrderStatus.PENDING_CONFIRMATION]: 0,
  [OrderStatus.REJECTED]: 0,
  [OrderStatus.AWAITING_PRODUCTION]: 0,
  [OrderStatus.IN_PROGRESS]: 45,
  [OrderStatus.COMPLETED]: 100,
  [OrderStatus.CANCELLED]: 0,
}

export function buildMockDeliveryProgress(
  order: OrderDetail
): OrderMockDeliveryProgress {
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )
  const deliveredPercent = DELIVERED_PERCENT_BY_STATUS[order.status]
  const deliveredQuantity = Math.round((totalQuantity * deliveredPercent) / 100)

  return {
    deliveredPercent,
    deliveredQuantity,
    remainingQuantity: totalQuantity - deliveredQuantity,
    deliveredVnd: roundMoney((order.totalVnd * deliveredPercent) / 100),
    remainingVnd: roundMoney((order.totalVnd * (100 - deliveredPercent)) / 100),
  }
}

// Same order-wide percent applied to one line's own quantity — the mock has
// no per-item delivery log, so every line is assumed to ship at the same
// pace as the order overall.
export function deriveMockItemDelivered(
  quantity: number,
  deliveredPercent: number
): { delivered: number; remaining: number } {
  const delivered = Math.round((quantity * deliveredPercent) / 100)
  return { delivered, remaining: quantity - delivered }
}

const DELIVERY_VEHICLES = ["51C-12345", "51D-67890", "50A-11223"]

export function buildMockDeliveryHistory(
  order: OrderDetail
): OrderMockDeliveryRow[] {
  const progress = buildMockDeliveryProgress(order)
  if (progress.deliveredQuantity === 0) {
    return []
  }

  seedFor(order)
  const orderDate = DateTime.fromISO(order.orderDate)
  const rowCount = order.status === OrderStatus.COMPLETED ? 2 : 1

  return Array.from({ length: rowCount }, (_, index) => {
    const share = rowCount === 1 ? 1 : 0.5

    return {
      code: `${order.code}-DO${String(index + 1).padStart(2, "0")}`,
      deliveredAt: toIso(
        orderDate.plus({ days: 2 + index * 3 }),
        order.orderDate
      ),
      quantity: Math.round(progress.deliveredQuantity * share),
      valueVnd: roundMoney(progress.deliveredVnd * share),
      vehicle: faker.helpers.arrayElement(DELIVERY_VEHICLES),
    }
  })
}

const PAYMENT_METHODS = ["Chuyển khoản", "Tiền mặt"]

export function buildMockPaymentHistory(
  order: OrderDetail
): OrderMockPaymentRow[] {
  const progress = buildMockDeliveryProgress(order)
  if (progress.deliveredPercent === 0) {
    return []
  }

  seedFor(order)
  const orderDate = DateTime.fromISO(order.orderDate)
  const rowCount = order.status === OrderStatus.COMPLETED ? 2 : 1
  const collectedBy = order.assignedUser?.fullName ?? "Kế toán"

  return Array.from({ length: rowCount }, (_, index) => {
    const share = rowCount === 1 ? 1 : 0.5

    return {
      paidAt: toIso(orderDate.plus({ days: 3 + index * 4 }), order.orderDate),
      amountVnd: roundMoney(
        order.totalVnd * (progress.deliveredPercent / 100) * share
      ),
      method: faker.helpers.arrayElement(PAYMENT_METHODS),
      collectedBy,
    }
  })
}

export function resolveMockPaymentStatus(
  order: OrderDetail
): OrderMockPaymentStatus {
  const deliveredPercent = DELIVERED_PERCENT_BY_STATUS[order.status]

  if (deliveredPercent >= 100) {
    return "paid"
  }

  return deliveredPercent > 0 ? "partially_paid" : "unpaid"
}

const DELIVERY_TERMS = [
  "FOB - Bình Dương",
  "CIF - Cảng Cát Lái",
  "Giao tại kho người bán",
  "EXW - Nhà máy",
]

// Delivery terms (FOB/CIF/…) aren't a real field on the wire yet — address/tax code now come
// from `order.client` instead (the backend's ClientBaseResDto), so this only stands in for
// `deliveryTerm`.
export function buildMockClientProfile(
  order: OrderDetail
): OrderMockClientProfile {
  seedFor(order)

  return {
    deliveryTerm: faker.helpers.arrayElement(DELIVERY_TERMS),
  }
}
