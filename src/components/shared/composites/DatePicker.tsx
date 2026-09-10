import { useState } from "react"
import { format, parseISO } from "date-fns"
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
// call site. Used as a plain controlled input (table filters/cells, no validation), wrapped by
// the shared `DateField` (`AppFormFields.tsx`) for most TanStack Form fields, and bound directly
// to react-hook-form's <Controller> fields in the `orders` feature's Create/Update sections
// (which pass onBlur/disabled — validation state stays on the surrounding `Field`/`FieldError`,
// same as the RadioGroup fields next to it). Parse/format is date-fns (Calendar wraps
// react-day-picker, which works in plain `Date`, not luxon `DateTime`) — value stays an ISO
// `yyyy-MM-dd` string at the public boundary so call sites don't move.
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
  const [open, setOpen] = useState(false)
  const selectedDate = value.length > 0 ? parseISO(value) : undefined

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) onBlur?.()
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between bg-background text-xs font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
            <CalendarIcon className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, "yyyy-MM-dd"))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
