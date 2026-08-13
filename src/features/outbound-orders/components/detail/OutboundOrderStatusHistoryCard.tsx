import { History } from "lucide-react"
import { DateTime } from "luxon"

import { OutboundOrderStatusBadge } from "@/features/outbound-orders/components/OutboundOrderBadges"
import type { OutboundOrderDetail } from "@/lib/types/outbound-order.type"
import { cn } from "@/lib/utils"

type OutboundOrderStatusHistoryCardProps = {
  detail: OutboundOrderDetail
}

export function OutboundOrderStatusHistoryCard({
  detail,
}: OutboundOrderStatusHistoryCardProps) {
  const history = detail.statusHistory.filter((h) => h.changedAt !== "")

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Lịch sử quy trình DO
      </div>

      <div className="p-4 sm:p-5">
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Chưa có lịch sử thay đổi.
          </p>
        ) : (
          <ol>
            {history.map((entry, index) => {
              const isLast = index === history.length - 1
              return (
                <li key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-1 flex size-2.5 shrink-0 rounded-full",
                        entry.status === "DELIVERED"
                          ? "bg-success"
                          : entry.status === "CANCELLED"
                            ? "bg-destructive"
                            : entry.status === "AWAITING_DELIVERY_CONFIRMATION"
                              ? "bg-sky-500"
                              : entry.status === "AWAITING_APPROVAL"
                                ? "bg-amber-500"
                                : "bg-muted-foreground"
                      )}
                    />
                    {!isLast && (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>

                  <div className={cn("min-w-0", isLast ? "pb-0" : "pb-5")}>
                    <OutboundOrderStatusBadge
                      status={entry.status}
                      className="text-[10px]"
                    />
                    {entry.changedAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {DateTime.fromISO(entry.changedAt).toFormat(
                          "dd/MM/yyyy HH:mm"
                        )}
                        {entry.changedBy ? ` · ${entry.changedBy}` : ""}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}
