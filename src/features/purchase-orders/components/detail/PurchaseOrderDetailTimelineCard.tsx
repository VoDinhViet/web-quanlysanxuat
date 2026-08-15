import { CheckCircle, CloseCircle, Route } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { buildPurchaseOrderTimeline } from "@/features/purchase-orders/purchase-order-timeline"
import type {
  PurchaseOrderDetail,
  PurchaseOrderTimelineStepState,
} from "@/lib/types/purchase-order.type"
import { cn } from "@/lib/utils"

type NodeVisual = {
  circleClassName: string
  icon: ComponentType<IconProps> | null
}

function resolveNodeVisual(state: PurchaseOrderTimelineStepState): NodeVisual {
  switch (state) {
    case "done":
      return {
        circleClassName: "bg-success text-success-foreground",
        icon: CheckCircle,
      }
    case "current":
      return {
        circleClassName:
          "bg-primary text-primary-foreground animate-pulse motion-reduce:animate-none",
        icon: null,
      }
    case "cancelled":
      return {
        circleClassName: "bg-destructive text-destructive-foreground",
        icon: CloseCircle,
      }
    case "upcoming":
      return {
        circleClassName: "border-2 border-border bg-card text-muted-foreground",
        icon: null,
      }
  }
}

type PurchaseOrderDetailTimelineCardProps = {
  purchaseOrder: PurchaseOrderDetail
}

// Mirrors PurchaseQuotationDetailTimelineCard.tsx — every node/timestamp comes straight off
// `purchaseOrder` via buildPurchaseOrderTimeline, no invented data.
export function PurchaseOrderDetailTimelineCard({
  purchaseOrder,
}: PurchaseOrderDetailTimelineCardProps) {
  const steps = buildPurchaseOrderTimeline(purchaseOrder)

  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Route className="size-4 text-muted-foreground" />
        Quy trình xử lý
      </div>
      <div className="p-4 sm:p-5">
        <ol>
          {steps.map((step, index) => {
            const visual = resolveNodeVisual(step.state)
            const isLast = index === steps.length - 1

            return (
              <li key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      visual.circleClassName
                    )}
                  >
                    {visual.icon ? (
                      <visual.icon className="size-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {isLast ? null : (
                    <span
                      className={cn(
                        "w-px flex-1",
                        step.state === "done" ? "bg-success" : "bg-border"
                      )}
                    />
                  )}
                </div>

                <div className={cn("min-w-0", isLast ? "pb-0" : "pb-6")}>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.state === "upcoming"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.timestamp ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {DateTime.fromISO(step.timestamp).toFormat(
                        "dd/MM/yyyy HH:mm"
                      )}
                      {step.actor ? ` · ${step.actor}` : ""}
                    </p>
                  ) : null}
                  {step.detail ? (
                    <p className="mt-1 text-xs font-medium text-destructive">
                      {step.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
