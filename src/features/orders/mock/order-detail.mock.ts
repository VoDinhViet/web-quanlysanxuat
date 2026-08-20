import { faker } from "@faker-js/faker"
import { DateTime } from "luxon"

import { roundMoney } from "@/lib/utils"
import { OrderStatus } from "@/lib/types/order.type"
import type {
  OrderDetail,
  OrderItem,
  OrderMockDeliveryProgress,
  OrderMockDeliveryRow,
} from "@/lib/types/order.type"

// Placeholder data for the order detail page's one remaining data-less section (order-level
// delivery/DO history — see the matching types in order.type.ts) — same idea as
// src/features/manage/mock/manage-dashboard.mock.ts, but seeded per order (via the order's own
// id) instead of once globally: two different orders shouldn't render identical numbers, while
// the SAME order must render the same numbers across re-renders/refetches. Delete this file once
// the backend ships DO tracking. (Payment history used to be mock too — now real, see
// get-order-payments.api.ts. The approval timeline used to live here too — it's now real data,
// see order-timeline.ts.)

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
const deliveredPercentByStatus: Record<OrderStatus, number> = {
  [OrderStatus.DRAFT]: 0,
  [OrderStatus.PENDING_CONFIRMATION]: 0,
  [OrderStatus.REJECTED]: 0,
  [OrderStatus.AWAITING_PRODUCTION]: 0,
  [OrderStatus.IN_PROGRESS]: 45,
  [OrderStatus.COMPLETED]: 100,
  [OrderStatus.CANCELLED]: 0,
}

export function buildMockDeliveryProgress(
  order: OrderDetail,
  items: OrderItem[]
): OrderMockDeliveryProgress {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const deliveredPercent = deliveredPercentByStatus[order.status]
  const deliveredQuantity = Math.round((totalQuantity * deliveredPercent) / 100)

  return {
    deliveredPercent,
    deliveredQuantity,
    remainingQuantity: totalQuantity - deliveredQuantity,
    deliveredVnd: roundMoney((order.totalVnd * deliveredPercent) / 100),
    remainingVnd: roundMoney((order.totalVnd * (100 - deliveredPercent)) / 100),
  }
}

const deliveryVehicles = ["51C-12345", "51D-67890", "50A-11223"]

export function buildMockDeliveryHistory(
  order: OrderDetail,
  items: OrderItem[]
): OrderMockDeliveryRow[] {
  const progress = buildMockDeliveryProgress(order, items)
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
      vehicle: faker.helpers.arrayElement(deliveryVehicles),
    }
  })
}
