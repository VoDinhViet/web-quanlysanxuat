import { useState } from "react"
import { parseDate } from "@internationalized/date"
import { DateTime } from "luxon"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerFieldProps = {
  id: string
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  isInvalid: boolean
  errors: ComponentProps<typeof FieldError>["errors"]
  disabled?: boolean
}

export function DatePickerField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  isInvalid,
  errors,
  disabled,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = value.length > 0 ? parseDate(value) : null

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <PopoverTrigger
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            onBlur()
          }
        }}
      >
        <Button
          id={id}
          type="button"
          variant="outline"
          isDisabled={disabled}
          aria-invalid={isInvalid}
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
              onBlur()
            }}
          />
        </Popover>
      </PopoverTrigger>
      <FieldError errors={errors} />
    </Field>
  )
}
