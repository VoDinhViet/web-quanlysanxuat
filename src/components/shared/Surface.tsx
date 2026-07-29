import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SurfaceProps = {
  className?: string
  contentClassName?: string
  children: ReactNode
}

// Flat bg-card/shadow-card shell shared by every list page's filter+table region — no
// ring, matching the idiom already used by forms, OrderDetailSectionCard and
// ProductDetailPage's own top section. Replaces 7 near-duplicate <section> blocks that
// had drifted into two slightly different shapes (some with a ring-1, some wrapping a
// dead grid + border-border div).
export function Surface({
  className,
  contentClassName,
  children,
}: SurfaceProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg bg-card shadow-card",
        className
      )}
    >
      <div className={cn("flex min-w-0 flex-col", contentClassName)}>
        {children}
      </div>
    </section>
  )
}
