import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CreateUserDateFieldProps = {
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

export function CreateUserDateField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  isInvalid,
  errors,
  disabled,
}: CreateUserDateFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = value.length > 0 ? parseISO(value) : undefined

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            onBlur()
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={isInvalid}
            className={cn(
              "h-9 w-full justify-between bg-background text-xs font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date ? format(date, "yyyy-MM-dd") : "")
              setIsOpen(false)
              onBlur()
            }}
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={errors} />
    </Field>
  )
}
