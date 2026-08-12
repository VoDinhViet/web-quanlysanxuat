import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type IqcDetailSectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Shared shell for every card on this detail page below the header — icon + title (+ optional
// trailing action), same idiom as SupplierReturnDetailSectionCard.tsx/PurchaseOrderStatusLegend's
// bespoke header, but feature-local per this repo's own convention (this feature's icons come
// from @solar-icons/react, matching IqcStatCards, not lucide-react). 3 uses from the start —
// IqcAqlInputCard, IqcDetailReferenceCard, IqcStatusLegend — so this isn't a preemptive
// abstraction.
export function IqcDetailSectionCard({
  icon: Icon,
  title,
  action,
  className,
  contentClassName,
  children,
}: IqcDetailSectionCardProps) {
  return (
    <section
      className={cn(
        "h-fit overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </div>
        {action}
      </div>
      <div className={cn("p-4 sm:p-5", contentClassName)}>{children}</div>
    </section>
  )
}
