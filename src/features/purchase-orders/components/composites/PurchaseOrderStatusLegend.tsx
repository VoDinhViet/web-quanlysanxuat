import { Info } from "lucide-react"

import { purchaseOrderStatusStyles } from "@/features/purchase-orders/components/primitives/PurchaseOrderBadges"
import {
  purchaseOrderStatusDescriptions,
  purchaseOrderStatusLabels,
  PurchaseOrderStatus,
} from "@/lib/types/purchase-order.type"
import { cn } from "@/lib/utils"

const statusTones = Object.values(PurchaseOrderStatus)

// Mirror PurchaseOrderLegend.tsx's shell but for the 3 real status values (not the list page's
// synthetic 5-value progress, which needs receivedQuantity the PO API never returns) — a
// separate component, single-column, sized for this page's 320px sidebar rather than the list
// page's full-width row.
export function PurchaseOrderStatusLegend() {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Info className="size-4 text-muted-foreground" />
        Chú thích trạng thái
      </div>

      <dl className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        {statusTones.map((status) => (
          <div key={status} className="min-w-0 space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  purchaseOrderStatusStyles[status].dot
                )}
              />
              {purchaseOrderStatusLabels[status]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {purchaseOrderStatusDescriptions[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
