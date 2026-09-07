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
// component owns the Date conversion for react-day-picker (which works in plain `Date`) and
// resyncs its local state when `from`/`to` change from outside (e.g. a reset-filters button),
// so every call site is a plain `<DateRangePicker from={search.x} to={search.y} onChange={...} />`
// with no date-fns import of its own.
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<DateRange>(() => parseRange(from, to))
  const [prevFrom, setPrevFrom] = useState(from)
  const [prevTo, setPrevTo] = useState(to)

  if (from !== prevFrom || to !== prevTo) {
    setPrevFrom(from)
    setPrevTo(to)
    setRange(parseRange(from, to))
  }

  const handleSelect = (next: DateRange | undefined) => {
    const nextRange = next ?? { from: undefined, to: undefined }
    setRange(nextRange)
    onChange(
      nextRange.from ? format(nextRange.from, "yyyy-MM-dd") : undefined,
      nextRange.to ? format(nextRange.to, "yyyy-MM-dd") : undefined
    )
    if (nextRange.from && nextRange.to) setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-start gap-2 bg-background text-xs font-normal",
              !range.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {range.from && range.to ? (
              <>
                {format(range.from, "dd/MM/yyyy")} -{" "}
                {format(range.to, "dd/MM/yyyy")}
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
        />
      </PopoverContent>
    </Popover>
  )
}
