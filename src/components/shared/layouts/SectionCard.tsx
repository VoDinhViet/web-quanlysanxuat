import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionCardProps = {
  icon: ComponentType<IconProps>
  title: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

// The card shell every detail-page section reuses: icon + title header, an optional
// right-aligned action slot, and a content area. `contentClassName`, when given, replaces the
// default padding outright rather than merging with it — a caller needing a `flex-col gap-*`
// content layout usually also needs its vertical padding to stay fixed across breakpoints,
// which a `cn("p-4 sm:p-5", contentClassName)` merge can't guarantee (Tailwind's own utility
// order, not class-string order, decides which `py-*` wins at each breakpoint).
export function SectionCard({
  icon: IconComponent,
  title,
  action,
  className,
  contentClassName,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground">
          <IconComponent className="size-4 text-muted-foreground" />
          {title}
        </div>
        {action}
      </div>
      <div className={cn(contentClassName ?? "p-4 sm:p-5")}>{children}</div>
    </section>
  )
}
