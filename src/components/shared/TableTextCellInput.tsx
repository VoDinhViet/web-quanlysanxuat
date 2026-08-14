import { useState } from "react"

import { Input } from "@/components/ui/input"

type TableTextCellInputProps = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  id?: string
}

// Bare text input for a compare-grid or picker cell — same local-state-until-blur reasoning as
// NumericCellInput.tsx in this folder (see its comment): every column using this cell rewrites
// the whole parent items array field, which cascades a full useReactTable row-model rebuild, so
// committing per keystroke dropped focus mid-type. Promoted to shared once a 2nd feature needed it
// (purchase-quotations' compare grid, purchase-requests' quantity step) — see
// .claude/rules/code-quality.md's "no abstraction until the 3rd use".
export function TableTextCellInput({
  value,
  onValueChange,
  disabled,
  placeholder,
  id,
}: TableTextCellInputProps) {
  const [localValue, setLocalValue] = useState(value)
  // Re-sync local state from an external value change (draft restore, reset) without an effect —
  // adjusting state during render, per React's docs, avoids the extra commit an effect causes.
  const [syncedValue, setSyncedValue] = useState(value)
  if (value !== syncedValue) {
    setSyncedValue(value)
    setLocalValue(value)
  }

  return (
    <Input
      id={id}
      className="h-8 bg-background text-xs"
      placeholder={placeholder}
      value={localValue}
      disabled={disabled}
      onChange={(event) => setLocalValue(event.target.value)}
      onBlur={() => onValueChange(localValue)}
    />
  )
}
