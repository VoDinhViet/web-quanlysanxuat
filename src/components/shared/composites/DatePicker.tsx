import { useState } from "react"
import { parseDate } from "@internationalized/date"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Bare Popover+Calendar+Button date widget — no Field/label/error wrapper, that stays at each
// call site. Used both as a plain controlled input (table filters/cells, no validation) and
// bound to react-hook-form's <Controller> fields (the `users` feature's Create/Update sections,
// which pass onBlur/disabled — validation state stays on the surrounding `Field`/`FieldError`,
// same as the RadioGroup fields next to it). All parse/format is luxon —
// `DateTime.fromISO(value).toFormat(...)`, safe under this repo's fixed `Settings.defaultZone`
// (src/lib/luxon-config.ts). The Calendar's own month/day captions render in the browser's
// default locale — no app-wide I18nProvider is wired (removed, see button.tsx phase notes).
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
  const selectedDate = value.length > 0 ? parseDate(value) : null

  return (
    <PopoverTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) onBlur?.()
      }}
    >
      <Button
        type="button"
        variant="outline"
        isDisabled={disabled}
        className={cn(
          "h-9 w-full justify-between bg-background text-xs font-normal",
          !selectedDate && "text-muted-foreground"
        )}
      >
        {selectedDate
          ? DateTime.fromISO(value).toFormat("dd/MM/yyyy")
          : "dd/mm/yyyy"}
        <CalendarIcon className="size-4" />
      </Button>
      <Popover className="w-auto p-0" placement="bottom start">
        <Calendar
          captionLayout="dropdown"
          value={selectedDate}
          onChange={(date) => {
            onChange(date.toString())
            setIsOpen(false)
          }}
        />
      </Popover>
    </PopoverTrigger>
  )
}
