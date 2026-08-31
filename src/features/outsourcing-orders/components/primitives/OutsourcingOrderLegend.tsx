import { Info } from "lucide-react"

import { outsourcingOrderStatusStyles } from "@/features/outsourcing-orders/components/primitives/OutsourcingOrderBadges"
import {
  OutsourcingOrderStatus,
  outsourcingOrderStatusDescriptions,
  outsourcingOrderStatusLabels,
} from "@/lib/types/outsourcing-order.type"
import { cn } from "@/lib/utils"

// 5 giá trị status thật sự (đã gộp tiến độ nhận hàng, docs/decisions/outsourcing-order-status-progress-merge.md
// phía be-quanlysanxuat) — không có DRAFT, OS-OUT không còn trạng thái nháp
// (docs/decisions/outsourcing-no-draft.md phía be-quanlysanxuat).
const statusValues = [
  OutsourcingOrderStatus.SENT,
  OutsourcingOrderStatus.PARTIAL,
  OutsourcingOrderStatus.WAITING_QC,
  OutsourcingOrderStatus.COMPLETED,
  OutsourcingOrderStatus.CANCELLED,
]

export function OutsourcingOrderLegend() {
  return (
    <section className="rounded-lg bg-card px-4 py-4 shadow-card lg:px-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Info className="size-4 text-muted-foreground" />
        Chú thích trạng thái
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {statusValues.map((status) => (
          <div key={status} className="min-w-0 space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  outsourcingOrderStatusStyles[status].dot
                )}
              />
              {outsourcingOrderStatusLabels[status]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {outsourcingOrderStatusDescriptions[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
