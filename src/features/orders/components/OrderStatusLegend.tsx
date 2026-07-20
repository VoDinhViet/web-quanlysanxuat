import { Info } from "lucide-react"

import {
  ORDER_BADGE_LABELS,
  ORDER_BADGE_STYLE,
} from "@/features/orders/components/OrderBadges"
import {
  ORDER_STATUS_DESCRIPTIONS,
  OVERDUE_DESCRIPTION,
  OVERDUE_FILTER_VALUE,
  OrderStatus,
} from "@/features/orders/types/order.type"
import { cn } from "@/lib/utils"
import type { OrderBadgeTone } from "@/features/orders/components/OrderBadges"

// Display order follows the table's typical flow rather than the enum order:
// active states first, then the waiting states, then the exception.
const LEGEND_TONES: OrderBadgeTone[] = [
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED,
  OrderStatus.PENDING_PRODUCTION,
  OrderStatus.PENDING_OUTSOURCING,
  OrderStatus.PENDING_CONFIRMATION,
  OVERDUE_FILTER_VALUE,
]

const LEGEND_DESCRIPTIONS: Record<OrderBadgeTone, string> = {
  ...ORDER_STATUS_DESCRIPTIONS,
  [OVERDUE_FILTER_VALUE]: OVERDUE_DESCRIPTION,
}

export function OrderStatusLegend() {
  return (
    <section className="rounded-lg bg-card px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] lg:px-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Info className="size-4 text-muted-foreground" />
        Chú thích trạng thái
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {LEGEND_TONES.map((tone) => (
          <div key={tone} className="min-w-0 space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  ORDER_BADGE_STYLE[tone].dot
                )}
              />
              {ORDER_BADGE_LABELS[tone]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {LEGEND_DESCRIPTIONS[tone]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
