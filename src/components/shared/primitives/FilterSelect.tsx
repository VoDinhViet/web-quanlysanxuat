import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type FilterSelectOption = {
  value: string
  label: string
}

type FilterSelectProps = {
  id: string
  label: string
  value: string
  options: FilterSelectOption[]
  onValueChange: (value: string) => void
  className?: string
}

// The labeled dropdown filter every table filter bar reuses (status, type, ...). The option
// list itself — including any "Tất cả" leading entry — stays the caller's own concern.
export function FilterSelect({
  id,
  label,
  value,
  options,
  onValueChange,
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-[11px] font-medium text-muted-foreground"
      >
        {label}
      </Label>
      <Select
        selectedKey={value}
        onSelectionChange={(key) => onValueChange(String(key))}
      >
        <SelectTrigger id={id} className="w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} id={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
