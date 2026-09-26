import { AddCircle, CheckCircle } from "@solar-icons/react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SpecialPermissionChipProps = {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}

/** A permission whose action isn't one of the matrix's 5 CRUD columns (`items:copy`,
 *  `items:bom-manage`, `inventory-requisitions:issue`, …) — rendered as a toggle chip on its
 *  module's row instead of forcing it into a column it doesn't semantically belong to. */
export function SpecialPermissionChip({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: SpecialPermissionChipProps) {
  const chip = (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={description ? `${label}. ${description}` : label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors select-none",
        checked
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {checked ? (
        <CheckCircle className="size-3.5" />
      ) : (
        <AddCircle className="size-3.5" />
      )}
      {label}
    </button>
  )

  if (!description) {
    return chip
  }

  return (
    <Tooltip>
      <TooltipTrigger render={chip} />
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  )
}
