import type { IconProps } from "@solar-icons/react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type StatusLegendItem = {
  key: string
  badge: ReactNode
  description: string
}

type StatusLegendProps = {
  icon: ComponentType<IconProps>
  title: string
  items: StatusLegendItem[]
  className?: string
}

// A legend column: icon + title heading, then a wrapping list of status badge + description
// rows. The badge itself stays a slot (domains keep their own status→badge lookup) — see
// InventoryRequisitionsLegend.tsx for a call site. Only 1 domain has migrated onto this so
// far; the repo's other *Legend.tsx files use a visually different (`dl`/`dt`/`dd`) shape that
// hasn't been reconciled with this one yet — see the ui-kit plan's Phase 2.4 note.
export function StatusLegend({
  icon: IconComponent,
  title,
  items,
  className,
}: StatusLegendProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <IconComponent className="size-4 text-primary" />
        <span>{title}</span>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-2">
            {item.badge}
            <span className="text-muted-foreground">{item.description}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
