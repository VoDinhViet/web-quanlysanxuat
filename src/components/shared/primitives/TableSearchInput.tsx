import type { KeyboardEvent } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type TableSearchInputProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  className?: string
}

// The labeled search input every table filter bar opens with — pair with
// `useFilterSearchTerm` for the debounce/Enter-to-flush behavior behind `onChange`/`onKeyDown`.
export function TableSearchInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  className,
}: TableSearchInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-[11px] font-medium text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        className="text-xs placeholder:text-muted-foreground/75"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
