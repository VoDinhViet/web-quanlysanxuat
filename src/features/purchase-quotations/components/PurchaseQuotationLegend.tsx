import { Info } from "lucide-react"

import { purchaseQuotationStatusStyles } from "@/features/purchase-quotations/components/PurchaseQuotationBadges"
import {
  purchaseQuotationStatusDescriptions,
  purchaseQuotationStatusLabels,
  PurchaseQuotationStatus,
} from "@/lib/types/purchase-quotation.type"
import { cn } from "@/lib/utils"

const statusTones = Object.values(PurchaseQuotationStatus)

export function PurchaseQuotationLegend() {
  return (
    <section className="rounded-lg bg-card px-4 py-4 shadow-card lg:px-5">
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <Info className="size-4 text-muted-foreground" />
        Chú thích trạng thái
      </h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusTones.map((status) => (
          <div key={status} className="min-w-0 space-y-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  purchaseQuotationStatusStyles[status].dot
                )}
              />
              {purchaseQuotationStatusLabels[status]}
            </dt>
            <dd className="text-[11px] text-muted-foreground">
              {purchaseQuotationStatusDescriptions[status]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
