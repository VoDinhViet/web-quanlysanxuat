import { CheckCircle, CloseCircle } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import type { TimelineStep, TimelineStepState } from "@/lib/types/timeline.type"
import { cn } from "@/lib/utils"

type NodeVisual = {
  circleClassName: string
  icon: ComponentType<IconProps> | null
}

function resolveNodeVisual(state: TimelineStepState): NodeVisual {
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

const dotStateClassName: Record<TimelineStepState, string> = {
  done: "bg-success",
  cancelled: "bg-destructive",
  current: "bg-amber-500",
  upcoming: "bg-amber-500",
}

type TimelineCardProps = {
  icon: ComponentType<IconProps>
  title: string
  steps: TimelineStep[]
  /** "circle" (default): numbered/icon node (done ✓, cancelled ✕, current pulses, upcoming
   *  outlined) — used by orders/purchase-orders/purchase-quotations. "dot": a small plain
   *  dot with no icon or number and denser spacing, no `detail` note row — used by
   *  payment-requests' sidebar card. */
  variant?: "circle" | "dot"
  /** Tailwind text-color class for a step's `detail` note (ignored by the "dot" variant,
   *  which never renders one). Domains disagree on tone: orders' note is a clarifying
   *  remark (text-primary), purchase-orders/purchase-quotations' is a rejection/
   *  cancellation reason (text-destructive) — default matches the latter, the more common
   *  case. */
  noteToneClassName?: string
  className?: string
}

// Shared timeline/history card — every detail page with an approval or lifecycle history
// renders this shell. Only the shell, node style and step→visual mapping are shared; what a
// step means for a given domain (which state to show when, whether a rejection reverts to
// DRAFT, ...) stays in that domain's own `logic/*-timeline.ts` builder.
export function TimelineCard({
  icon: IconComponent,
  title,
  steps,
  variant = "circle",
  noteToneClassName = "text-destructive",
  className,
}: TimelineCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <IconComponent className="size-4 text-muted-foreground" />
        {title}
      </div>
      <div className="p-4 sm:p-5">
        <ol>
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1

            if (variant === "dot") {
              return (
                <li key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-1 flex size-2.5 shrink-0 rounded-full",
                        dotStateClassName[step.state]
                      )}
                    />
                    {isLast ? null : (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    )}
                  </div>

                  <div className={cn("min-w-0", isLast ? "pb-0" : "pb-5")}>
                    <p className="text-xs font-medium text-foreground">
                      {step.label}
                    </p>
                    {step.timestamp ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {DateTime.fromISO(step.timestamp).toFormat(
                          "dd/MM/yyyy HH:mm"
                        )}
                        {step.actor ? ` · ${step.actor}` : ""}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            }

            const visual = resolveNodeVisual(step.state)

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
                    <p
                      className={cn(
                        "mt-1 text-xs font-medium",
                        noteToneClassName
                      )}
                    >
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
