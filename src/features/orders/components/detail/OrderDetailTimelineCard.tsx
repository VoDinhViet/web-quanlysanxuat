import { Icon } from "@iconify/react"
import checkCircleBold from "@iconify-icons/solar/check-circle-bold"
import closeCircleBold from "@iconify-icons/solar/close-circle-bold"
import routeBold from "@iconify-icons/solar/route-bold"
import { DateTime } from "luxon"
import type { IconifyIcon } from "@iconify/types"

import { OrderDetailSectionCard } from "@/features/orders/components/detail/OrderDetailSectionCard"
import { buildOrderTimeline } from "@/features/orders/order-timeline"
import type {
  OrderDetail,
  OrderTimelineStepState,
} from "@/lib/types/order.type"
import { cn } from "@/lib/utils"

type NodeVisual = {
  circleClassName: string
  icon: IconifyIcon | null
}

function resolveNodeVisual(state: OrderTimelineStepState): NodeVisual {
  switch (state) {
    case "done":
      return {
        circleClassName: "bg-success text-success-foreground",
        icon: checkCircleBold,
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
        icon: closeCircleBold,
      }
    case "upcoming":
      return {
        circleClassName: "border-2 border-border bg-card text-muted-foreground",
        icon: null,
      }
  }
}

type OrderDetailTimelineCardProps = {
  order: OrderDetail
}

// The one deliberate visual anchor of the page — every other section stays
// quiet. Every node and timestamp comes straight from the order's real
// approval fields (order-timeline.ts) — no mock data.
export function OrderDetailTimelineCard({
  order,
}: OrderDetailTimelineCardProps) {
  const steps = buildOrderTimeline(order)

  return (
    <OrderDetailSectionCard icon={routeBold} title="Quy trình đơn hàng">
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
                    <Icon icon={visual.icon} className="size-4" />
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
                  <p className="mt-1 text-xs font-medium text-primary">
                    {step.detail}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </OrderDetailSectionCard>
  )
}
