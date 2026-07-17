import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { ComponentProps } from "react"

type LoginPasswordFieldProps = {
  name: string
  value: string
  errors: ComponentProps<typeof FieldError>["errors"]
  isInvalid: boolean
  disabled: boolean
  onBlur: () => void
  onChange: (value: string) => void
}

export function LoginPasswordField({
  name,
  value,
  errors,
  isInvalid,
  disabled,
  onBlur,
  onChange,
}: LoginPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        htmlFor={name}
        className="text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        Mật khẩu
      </FieldLabel>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          className="h-12 pr-11"
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
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      <FieldError errors={errors} />
    </Field>
  )
}
