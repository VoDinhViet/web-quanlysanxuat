import { Search } from "lucide-react"
import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_OPTION_VALUE = "all"

type FilterFieldProps = {
  label: string
  htmlFor?: string
  children: ReactNode
}

export function FilterField({ label, htmlFor, children }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

type TextFilterFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
}

export function TextFilterField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
}: TextFilterFieldProps) {
  return (
    <FilterField label={label} htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </FilterField>
  )
}

type SelectFilterFieldProps = {
  id: string
  label: string
  options: { value: string; label: string }[]
  // `undefined` = "Tất cả" (không lọc) — ô tự thêm lựa chọn này nên cha không phải giữ chuỗi "all".
  value: string | undefined
  onValueChange: (value: string | undefined) => void
}

export function SelectFilterField({
  id,
  label,
  options,
  value,
  onValueChange,
}: SelectFilterFieldProps) {
  const items = [{ value: ALL_OPTION_VALUE, label: "Tất cả" }, ...options]

  return (
    <FilterField label={label} htmlFor={id}>
      <Select
        items={items}
        value={value ?? ALL_OPTION_VALUE}
        onValueChange={(next) =>
          next !== null &&
          onValueChange(next === ALL_OPTION_VALUE ? undefined : next)
        }
      >
        <SelectTrigger id={id} className="w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  )
}
