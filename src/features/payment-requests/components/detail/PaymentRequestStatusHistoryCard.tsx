import { History } from "lucide-react"
import { DateTime } from "luxon"

import { buildPaymentRequestTimeline } from "@/features/payment-requests/payment-request-timeline"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"
import { cn } from "@/lib/utils"

type PaymentRequestStatusHistoryCardProps = {
  detail: PaymentRequestDetail
}

// Vertical timeline sidebar card — same node/connector idiom as
// PurchaseOrderDetailTimelineCard.tsx, driven by buildPaymentRequestTimeline().
export function PaymentRequestStatusHistoryCard({
  detail,
}: PaymentRequestStatusHistoryCardProps) {
  const history = buildPaymentRequestTimeline(detail)

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Lịch sử trạng thái
      </div>

      <div className="p-4 sm:p-5">
        <ol>
          {history.map((entry, index) => {
            const isLast = index === history.length - 1
            return (
              <li key={entry.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 flex size-2.5 shrink-0 rounded-full",
                      entry.state === "done"
                        ? "bg-success"
                        : entry.state === "cancelled"
                          ? "bg-destructive"
                          : "bg-amber-500"
                    )}
                  />
                  {!isLast && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>

                <div className={cn("min-w-0", isLast ? "pb-0" : "pb-5")}>
                  <p className="text-xs font-medium text-foreground">
                    {entry.label}
                  </p>
                  {entry.timestamp && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {DateTime.fromISO(entry.timestamp).toFormat(
                        "dd/MM/yyyy HH:mm"
                      )}
                      {entry.actor ? ` · ${entry.actor}` : ""}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
