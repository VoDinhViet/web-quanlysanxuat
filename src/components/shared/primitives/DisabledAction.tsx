import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

type DisabledActionProps = {
  label: string
  hint?: string
  children: ReactNode
}

// Disabled icon-button + tooltip for a table row action that has no route/API yet. The
// <span tabIndex={0}> wrapper is required — a disabled button swallows pointer events and the
// tooltip would never fire. Promoted here from orders/OrderTableCells.tsx +
// production-jobs/ProductionJobTableCells.tsx once purchase-requests became a third, identical
// use (see .claude/rules/code-quality.md, "no abstraction until the third use").
export function DisabledAction({
  label,
  hint = "tính năng sắp có",
  children,
}: DisabledActionProps) {
  return (
    <TooltipTrigger>
      <span tabIndex={0}>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="pointer-events-none bg-background text-muted-foreground"
          aria-label={label}
          isDisabled
        >
          {children}
        </Button>
      </span>
      <Tooltip>{`${label} — ${hint}`}</Tooltip>
    </TooltipTrigger>
  )
}
