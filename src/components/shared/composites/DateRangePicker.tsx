import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateRangePickerProps = {
  id?: string
  from?: string
  to?: string
  onChange: (from: string | undefined, to: string | undefined) => void
}

function parseRange(
  from: string | undefined,
  to: string | undefined
): DateRange {
  return {
    from: from ? parseISO(from) : undefined,
    to: to ? parseISO(to) : undefined,
  }
}

// Single popover, one range Calendar — picks "from" and "to" in one view instead of two separate
// pickers side by side. `from`/`to` are ISO "yyyy-MM-dd" strings (URL search param shape) — the
// trigger label reads them directly, so it always shows the applied filter regardless of
// whatever the calendar is mid-picking. `range` is just the calendar's own working state: it
// starts fresh from `from`/`to` every time the popover opens and, via `resetOnSelect`, click 1
// sets only `from` (popover stays open, nothing applied yet) while click 2 completes the range
// (or restarts it, if a range was already complete) — `onChange` fires, and the popover closes.
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange>(() => parseRange(from, to))

  const handleSelect = (next: DateRange | undefined) => {
    const nextRange = next ?? { from: undefined, to: undefined }
    setRange(nextRange)

    if (nextRange.from && !nextRange.to) return // first click of a new range – keep picking

    onChange(
      nextRange.from ? format(nextRange.from, "yyyy-MM-dd") : undefined,
      nextRange.to ? format(nextRange.to, "yyyy-MM-dd") : undefined
    )
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setRange(parseRange(from, to)) // start each open from the applied filter
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-start gap-2 bg-background text-xs font-normal",
              !from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {from && to ? (
              <>
                {format(parseISO(from), "dd/MM/yyyy")} -{" "}
                {format(parseISO(to), "dd/MM/yyyy")}
              </>
            ) : (
              "dd/mm/yyyy - dd/mm/yyyy"
            )}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          resetOnSelect
        />
      </PopoverContent>
    </Popover>
  )
}
