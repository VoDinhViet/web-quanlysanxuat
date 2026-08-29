import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DetailHeaderProps = {
  // The whole back button element (<Button asChild><Link to=... search=.../></Button>) — kept
  // at the call site so its route `to`/`search` stay type-checked against the route tree; a
  // generic prop here would lose that, the same way extracting a row action's <Link> would.
  back: ReactNode
  code: string
  badge: ReactNode
  meta: ReactNode
  actions?: ReactNode
  className?: string
}

// The identity row every detail page opens with: back button, code, status badge, a meta
// field grid, and an action slot pinned to the right. The meta grid's own column layout
// varies by domain (field count differs), so it's a slot here, not a fixed `grid` div — see
// InventoryRequisitionDetailHeader.tsx for a call site.
export function DetailHeader({
  back,
  code,
  badge,
  meta,
  actions,
  className,
}: DetailHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {back}
          <span className="font-mono text-lg font-bold text-foreground">
            {code}
          </span>
          {badge}
        </div>

        {meta}
      </div>

      {actions}
    </div>
  )
}
