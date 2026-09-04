import { Info } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"

type FilterLabelProps = {
  label: string
  htmlFor?: ComponentProps<typeof Label>["htmlFor"]
  tooltip?: ReactNode
}

// A label + optional info tooltip for the plain controlled inputs a table
// filter bar uses — not a form Field, so it carries none of TanStack Form's
// state/validation plumbing.
export function FilterLabel({ label, htmlFor, tooltip }: FilterLabelProps) {
  return (
    <div className="flex items-center gap-1">
      <Label
        htmlFor={htmlFor}
        className="text-[11px] font-medium text-muted-foreground"
      >
        {label}
      </Label>
      {tooltip && (
        <TooltipTrigger>
          <button
            type="button"
            className="text-muted-foreground/50 hover:text-muted-foreground"
          >
            <Info className="size-3" />
          </button>
          <Tooltip
            placement="top"
            className="flex-col items-start gap-0.5 text-left"
          >
            {tooltip}
          </Tooltip>
        </TooltipTrigger>
      )}
    </div>
  )
}
