import { useState } from "react"
import { NumericFormat } from "react-number-format"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type NumericCellInputProps = {
  value: number | undefined
  onValueChange: (value: number | undefined) => void
  disabled?: boolean
  placeholder?: string
  // Floor enforced on blur (e.g. a requested quantity can't commit as 0) — clamped there rather
  // than blocked while typing, so clearing the field to retype doesn't get fought mid-edit.
  min?: number
  // Override the default h-8/text-xs sizing for a caller whose row has more room (e.g. a
  // 2-input picker step) — omit to keep every other caller's compact grid-cell sizing unchanged.
  className?: string
}

// Bare version of AppFormFields.tsx's NumberField — same NumericFormat recipe, no Field/Label
// chrome, since a compare-grid or picker cell has no room for either. Promoted to shared once a
// 2nd feature needed it (purchase-quotations' supplier compare grid, purchase-requests' quantity
// step) — see .claude/rules/code-quality.md's "no abstraction until the 3rd use".
//
// Value is local state, only committed to the form on blur — every column using this cell
// mutates an items array field wired into useReactTable, which cascades a full row-model rebuild
// on every commit. Committing per keystroke made that rebuild run once per character, which was
// dropping focus mid-type; committing on blur (the pattern TanStack Table's own "Editable Data"
// example uses for exactly this shape of data source) keeps typing local and cheap, and clicking
// another control still blurs first, so nothing here is lost on submit/draft-save.
export function NumericCellInput({
  value,
  onValueChange,
  disabled,
  placeholder,
  min,
  className,
}: NumericCellInputProps) {
  const [localValue, setLocalValue] = useState(value)
  // Re-sync local state from an external value change (draft restore, reset) without an effect —
  // adjusting state during render, per React's docs, avoids the extra commit an effect causes.
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    setLocalValue(value)
  }

  const commit = () => {
    const committed =
      min !== undefined && localValue !== undefined && localValue < min
        ? min
        : localValue
    if (committed !== localValue) setLocalValue(committed)
    onValueChange(committed)
  }

  return (
    <NumericFormat
      customInput={Input}
      className={cn("h-8 w-full bg-background text-xs", className)}
      value={localValue ?? ""}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      placeholder={placeholder}
      onValueChange={(values) => setLocalValue(values.floatValue)}
      onBlur={commit}
      disabled={disabled}
    />
  )
}
