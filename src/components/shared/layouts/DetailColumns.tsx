import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DetailColumnsProps = {
  main: ReactNode
  sidebar: ReactNode
  className?: string
}

// The 2-column detail-page grid: main content left, a fixed-width sidebar right, collapsing to
// 1 column below `xl`. 320px matches inventory-requisitions' sidebar today — other domains
// (orders: 360px, ...) use different widths and haven't migrated onto this yet; add a
// `sidebarWidth` prop (a literal-class lookup, Tailwind can't see an interpolated arbitrary
// value) once a second width actually needs it.
export function DetailColumns({
  main,
  sidebar,
  className,
}: DetailColumnsProps) {
  return (
    <div
      className={cn("grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]", className)}
    >
      {main}
      <div className="flex flex-col gap-4">{sidebar}</div>
    </div>
  )
}
