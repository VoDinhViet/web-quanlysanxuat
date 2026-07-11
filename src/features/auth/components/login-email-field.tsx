import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ComponentProps } from "react"

type LoginEmailFieldProps = {
  name: string
  value: string
  errors: ComponentProps<typeof FieldError>["errors"]
  isInvalid: boolean
  disabled: boolean
  onBlur: () => void
  onChange: (value: string) => void
}

export function LoginEmailField({
  name,
  value,
  errors,
  isInvalid,
  disabled,
  onBlur,
  onChange,
}: LoginEmailFieldProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        htmlFor={name}
        className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        Email
      </FieldLabel>
      <Input
        id={name}
        name={name}
        type="email"
        placeholder="Nhập email"
        autoComplete="email"
        className="h-12 pr-10"
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
