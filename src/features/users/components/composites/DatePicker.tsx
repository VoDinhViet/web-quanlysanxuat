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

// Bare Popover+Calendar+Button date picker for CreateUserForm.tsx's react-hook-form
// <Controller> fields — no Field/label/error wrapper, that stays at each call site (same
// idiom as the Select/Input fields around it). All parse/format is luxon — same
// `DateTime.fromISO(value).toJSDate()` / `.toFormat(...)` idiom as DatePickerField.tsx/
// DatePicker.tsx, safe under this repo's fixed `Settings.defaultZone`
// (src/lib/luxon-config.ts). `date-fns/locale`'s `vi` is only for the Calendar's own month/day
// captions — react-day-picker's `locale` prop is typed against date-fns's `Locale`, so it can't
// take a luxon value. Feature-local since CreateUserForm.tsx is still an RHF trial (see
// forms-and-ui.md).
type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  isInvalid?: boolean
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  isInvalid,
  disabled,
}: DatePickerProps) {
  const selectedDate =
    value.length > 0 ? DateTime.fromISO(value).toJSDate() : undefined

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? DateTime.fromJSDate(date).toFormat("yyyy-MM-dd") : "")
  }

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) onBlur()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={isInvalid}
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
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
