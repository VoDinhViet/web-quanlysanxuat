import { useState } from "react"
import { vi } from "date-fns/locale"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Bare Popover+Calendar+Button date widget — no Field/label/error wrapper, that stays at each
// call site. Used both as a plain controlled input (table filters/cells, no validation) and
// bound to react-hook-form's <Controller> fields (the `users` feature's Create/Update sections,
// which pass onBlur/disabled — validation state stays on the surrounding `Field`/`FieldError`,
// same as the RadioGroup fields next to it). All parse/format is luxon —
// `DateTime.fromISO(value).toJSDate()` / `.toFormat(...)`, safe under this repo's fixed
// `Settings.defaultZone` (src/lib/luxon-config.ts). `date-fns/locale`'s `vi` is only for the
// Calendar's own month/day captions — react-day-picker's `locale` prop is typed against
// date-fns's `Locale`, so it can't take a luxon value.
type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate =
    value.length > 0 ? DateTime.fromISO(value).toJSDate() : undefined

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 w-full justify-between bg-background text-xs font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          {selectedDate
            ? DateTime.fromJSDate(selectedDate).toFormat("dd/MM/yyyy")
            : "dd/mm/yyyy"}
          <CalendarIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          locale={vi}
          selected={selectedDate}
          onSelect={(date) => {
            onChange(
              date ? DateTime.fromJSDate(date).toFormat("yyyy-MM-dd") : ""
            )
            setIsOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
