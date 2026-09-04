import { useState } from "react"
import { parseDate } from "@internationalized/date"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"
import type { CalendarDate } from "@internationalized/date"
import type { RangeValue } from "react-aria-components"

import { Button } from "@/components/ui/button"
import { RangeCalendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateRangePickerProps = {
  id: ComponentProps<typeof Button>["id"]
  from: string | undefined
  to: string | undefined
  onChange: (range: {
    from: string | undefined
    to: string | undefined
  }) => void
}

// Single popover, one RangeCalendar — picks "from" and "to" in one view instead of two separate
// pickers side by side. Not a form Field: plain controlled value/onChange bound straight to a
// search param, ISO "yyyy-MM-dd" strings in and out (matching every other date field in the
// app), not raw @internationalized/date values. RAC's RangeCalendar tracks the in-progress
// selection with its own internal anchor state and only calls onChange once a full range is
// picked — unlike the old react-day-picker widget, `onChange` here no longer fires after just
// the first click.
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const value: RangeValue<CalendarDate> | null =
    from && to ? { start: parseDate(from), end: parseDate(to) } : null

  return (
    <PopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn(
          "h-9 w-full justify-start gap-2 bg-background text-xs font-normal",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="size-4" />
        {from && to ? (
          <>
            {DateTime.fromISO(from).toFormat("dd/MM/yyyy")} -{" "}
            {DateTime.fromISO(to).toFormat("dd/MM/yyyy")}
          </>
        ) : (
          "dd/mm/yyyy - dd/mm/yyyy"
        )}
      </Button>
      <Popover className="w-auto p-0" placement="bottom start">
        <RangeCalendar
          captionLayout="dropdown"
          value={value}
          onChange={(range) => {
            onChange({ from: range.start.toString(), to: range.end.toString() })
            setIsOpen(false)
          }}
          numberOfMonths={2}
        />
      </Popover>
    </PopoverTrigger>
  )
}
