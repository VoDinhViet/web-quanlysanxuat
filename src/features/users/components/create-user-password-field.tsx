import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type CreateUserPasswordFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  errors: ComponentProps<typeof FieldError>["errors"]
  isInvalid: boolean
  disabled?: boolean
  onBlur: () => void
  onChange: (value: string) => void
}

export function CreateUserPasswordField({
  id,
  label,
  placeholder,
  value,
  errors,
  isInvalid,
  disabled,
  onBlur,
  onChange,
}: CreateUserPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-9 bg-background pr-9 text-xs"
          value={value}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isInvalid}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      </div>
      <FieldError errors={errors} />
    </Field>
  )
}
