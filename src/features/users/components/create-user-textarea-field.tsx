import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { ComponentProps } from "react"

type CreateUserTextareaFieldProps = {
  id: string
  label: string
  placeholder?: string
  value: string
  errors?: ComponentProps<typeof FieldError>["errors"]
  disabled?: boolean
  className?: string
  onBlur: () => void
  onChange: (value: string) => void
}

export function CreateUserTextareaField({
  id,
  label,
  placeholder,
  value,
  errors,
  disabled,
  className,
  onBlur,
  onChange,
}: CreateUserTextareaFieldProps) {
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </FieldLabel>
      <Textarea
        id={id}
        name={id}
        placeholder={placeholder}
        className="min-h-20 resize-none bg-background text-xs"
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <FieldError errors={errors} />
    </Field>
  )
}
