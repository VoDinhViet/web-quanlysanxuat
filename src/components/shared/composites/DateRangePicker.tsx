import { useState } from "react"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"
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
  id: ComponentProps<typeof Button>["id"]
  from: string | undefined
  to: string | undefined
  onChange: (range: {
    from: string | undefined
    to: string | undefined
  }) => void
}

function toDate(value: string | undefined): Date | undefined {
  return value ? DateTime.fromISO(value).toJSDate() : undefined
}

function toIso(date: Date | undefined): string | undefined {
  return date ? DateTime.fromJSDate(date).toFormat("yyyy-MM-dd") : undefined
}

// Single popover, one Calendar in range mode — picks "from" and "to" in one
// view instead of two separate pickers side by side. Not a form Field: plain
// controlled value/onChange bound straight to a search param, ISO
// "yyyy-MM-dd" strings in and out (matching every other date field in the
// app), not raw Date objects.
export function DateRangePicker({
  id,
  from,
  to,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected: DateRange | undefined =
    from || to ? { from: toDate(from), to: toDate(to) } : undefined

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 bg-background text-xs font-normal",
            !selected?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="size-4" />
          {selected?.from ? (
            selected.to ? (
              <>
                {DateTime.fromJSDate(selected.from).toFormat("dd/MM/yyyy")} -{" "}
                {DateTime.fromJSDate(selected.to).toFormat("dd/MM/yyyy")}
              </>
            ) : (
              DateTime.fromJSDate(selected.from).toFormat("dd/MM/yyyy")
            )
          ) : (
            "dd/mm/yyyy - dd/mm/yyyy"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          selected={selected}
          onSelect={(range) => {
            onChange({ from: toIso(range?.from), to: toIso(range?.to) })
            if (range?.from && range.to) {
              setIsOpen(false)
            }
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
