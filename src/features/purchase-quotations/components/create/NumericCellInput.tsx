import { NumericFormat } from "react-number-format"

import { Input } from "@/components/ui/input"

type NumericCellInputProps = {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  id?: string
}

// Bare version of AppFormFields.tsx's NumberField — same NumericFormat recipe, no Field/Label
// chrome, since a compare-grid cell has no room for either. Shared by both the outer "SL báo
// giá" column and the inner quote table's price/leadtime columns.
export function NumericCellInput({
  value,
  onValueChange,
  disabled,
  placeholder,
  id,
}: NumericCellInputProps) {
  return (
    <NumericFormat
      id={id}
      customInput={Input}
      className="h-8 w-full bg-background text-xs"
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      placeholder={placeholder}
      onValueChange={(values) => onValueChange(values.value)}
      disabled={disabled}
    />
  )
}
