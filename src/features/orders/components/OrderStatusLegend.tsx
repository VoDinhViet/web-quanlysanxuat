import { Info } from "lucide-react"

import {
  orderBadgeLabels,
  orderBadgeStyles,
} from "@/features/orders/components/OrderBadges"
import {
  orderStatusDescriptions,
  overdueDescription,
  overdueTone,
  OrderStatus,
} from "@/lib/types/order.type"
import { cn } from "@/lib/utils"
import type { OrderBadgeTone } from "@/features/orders/components/OrderBadges"

// Display order follows the table's typical flow rather than the enum order:
// active states first, then the waiting states, then the exception.
const legendTones: OrderBadgeTone[] = [
  OrderStatus.DRAFT,
  OrderStatus.PENDING_CONFIRMATION,
  OrderStatus.REJECTED,
  OrderStatus.AWAITING_PRODUCTION,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  overdueTone,
]

const legendDescriptions: Record<OrderBadgeTone, string> = {
  ...orderStatusDescriptions,
  [overdueTone]: overdueDescription,
}

export function OrderStatusLegend() {
  return (
    <section className="rounded-lg bg-card px-4 py-4 shadow-card lg:px-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Info className="size-4 text-muted-foreground" />
        Chú thích trạng thái
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {legendTones.map((tone) => (
          <div key={tone} className="min-w-0 space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  orderBadgeStyles[tone].dot
                )}
              />
              {orderBadgeLabels[tone]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {legendDescriptions[tone]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
