import { useState } from "react"
import { NumericFormat } from "react-number-format"

import { Input } from "@/components/ui/input"

type NumericCellInputProps = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  id?: string
  // Floor enforced on blur (e.g. a requested quantity can't commit as 0) — clamped there rather
  // than blocked while typing, so clearing the field to retype doesn't get fought mid-edit.
  min?: number
}

// Bare version of AppFormFields.tsx's NumberField — same NumericFormat recipe, no Field/Label
// chrome, since a compare-grid cell has no room for either. Shared by both the outer "SL báo
// giá" column and the inner quote table's price/leadtime columns.
//
// Value is local state, only committed to the form on blur — every column using this cell
// mutates itemsField by rewriting the whole parent item/quotes array (see
// CreateQuotationSuppliersItemColumns.tsx / CreateQuotationSuppliersQuoteColumns.tsx), which
// cascades a full outer-table + nested-quote-table row-model rebuild through useReactTable on
// every commit. Committing per keystroke made that rebuild run once per character, which was
// dropping focus mid-type; committing on blur (the pattern TanStack Table's own "Editable Data"
// example uses for exactly this shape of data source) keeps typing local and cheap, and clicking
// another control still blurs first, so nothing here is lost on submit/draft-save.
export function NumericCellInput({
  value,
  onValueChange,
  disabled,
  placeholder,
  id,
  min,
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
      min !== undefined && localValue !== "" && Number(localValue) < min
        ? String(min)
        : localValue
    if (committed !== localValue) setLocalValue(committed)
    onValueChange(committed)
  }

  return (
    <NumericFormat
      id={id}
      customInput={Input}
      className="h-8 w-full bg-background text-xs"
      value={localValue}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      placeholder={placeholder}
      onValueChange={(values) => setLocalValue(values.value)}
      onBlur={commit}
      disabled={disabled}
    />
  )
}
