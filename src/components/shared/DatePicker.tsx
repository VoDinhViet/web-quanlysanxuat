import { useState } from "react"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  id: ComponentProps<typeof Button>["id"]
  value: string
  onChange: (value: string) => void
}

// A plain controlled Popover+Calendar+Button date picker — not a form Field,
// so it carries none of TanStack Form's state/validation plumbing. Value is
// an ISO "yyyy-MM-dd" string (matching a search-param field), not a Date.
export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate =
    value.length > 0 ? DateTime.fromISO(value).toJSDate() : undefined

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
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
