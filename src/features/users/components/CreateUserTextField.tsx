import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ComponentProps } from "react"

type CreateUserTextFieldProps = {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  type?: ComponentProps<typeof Input>["type"]
  value: string
  errors?: ComponentProps<typeof FieldError>["errors"]
  isInvalid?: boolean
  disabled?: boolean
  className?: string
  onBlur: () => void
  onChange: (value: string) => void
}

export function CreateUserTextField({
  id,
  label,
  required,
  placeholder,
  type = "text",
  value,
  errors,
  isInvalid = false,
  disabled,
  className,
  onBlur,
  onChange,
}: CreateUserTextFieldProps) {
  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        className="h-9 bg-background text-xs"
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={isInvalid}
        disabled={disabled}
      />
      <FieldError errors={errors} />
    </Field>
  )
}
