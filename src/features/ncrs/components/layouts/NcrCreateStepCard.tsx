import { Check } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type NcrCreateStepCardProps = {
  step: number
  title: string
  description: string
  isDone: boolean
  isDisabled?: boolean
  children: ReactNode
}

// One numbered step of the create-NCR page: the number turns into a check once the step is
// filled, and a disabled step (waiting on an earlier one) dims out.
export function NcrCreateStepCard({
  step,
  title,
  description,
  isDone,
  isDisabled,
  children,
}: NcrCreateStepCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-card shadow-xs transition-opacity",
        isDisabled && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            isDone && "bg-success-soft text-success-ink",
            !isDone && !isDisabled && "bg-primary text-primary-foreground",
            !isDone && isDisabled && "bg-muted text-muted-foreground"
          )}
        >
          {isDone ? <Check className="size-4" strokeWidth={3} /> : step}
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-sm font-medium text-foreground">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
