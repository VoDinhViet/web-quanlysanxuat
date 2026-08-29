import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type RowActionsProps = {
  children: ReactNode
  className?: string
}

// The centered icon-button row every table's ActionsCell reuses. Individual actions stay a
// slot — a `DisabledAction`, a route `<Link>`-wrapped IconButton, a dialog trigger — since
// extracting those themselves would lose their route param type-checking, same reasoning as
// DetailHeader's `back` slot. See InventoryRequisitionsTableCells.tsx for a call site.
export function RowActions({ children, className }: RowActionsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      {children}
    </div>
  )
}
