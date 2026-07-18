import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DatePickerField } from "@/components/shared/DatePickerField"
import { useFieldContext } from "@/hooks/use-app-form-context"
import { cn } from "@/lib/utils"

type TextFieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  type?: ComponentProps<typeof Input>["type"]
  disabled?: boolean
  // Override the input's `id`/label `htmlFor` (defaults to the field name). Use
  // this when two forms on the same page share field names — e.g. a dialog form
  // rendered alongside the page form — to avoid duplicate DOM ids.
  id?: string
}

export function TextField({
  label,
  required,
  placeholder,
  type = "text",
  disabled,
  id,
}: TextFieldProps) {
  const field = useFieldContext<string>()
  const inputId = id ?? field.name
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        htmlFor={inputId}
        className="text-xs font-medium text-foreground"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Input
        id={inputId}
        name={field.name}
        type={type}
        placeholder={placeholder}
        className="h-9 bg-background text-xs"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={isInvalid}
        disabled={disabled}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

type TextareaFieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  // See `TextFieldProps.id` — overrides the textarea id/label htmlFor.
  id?: string
}

export function TextareaField({
  label,
  required,
  placeholder,
  disabled,
  className,
  id,
}: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const inputId = id ?? field.name

  return (
    <Field className={className}>
      <FieldLabel
        htmlFor={inputId}
        className="text-xs font-medium text-foreground"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Textarea
        id={inputId}
        name={field.name}
        placeholder={placeholder}
        className="min-h-20 resize-none bg-background text-xs"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        disabled={disabled}
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

type PasswordFieldProps = {
  label: string
  placeholder?: string
  disabled?: boolean
}

export function PasswordField({
  label,
  placeholder,
  disabled,
}: PasswordFieldProps) {
  const field = useFieldContext<string>()
  const [showPassword, setShowPassword] = useState(false)
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        htmlFor={field.name}
        className="text-xs font-medium text-foreground"
      >
        {label}
      </FieldLabel>
      <div className="relative">
        <Input
          id={field.name}
          name={field.name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-9 bg-background pr-9 text-xs"
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
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
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  label: string
  required?: boolean
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
}

export function SelectField({
  label,
  required,
  placeholder,
  options,
  disabled,
}: SelectFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel
        htmlFor={field.name}
        className="text-xs font-medium text-foreground"
      >
        {label} {required ? <span className="text-destructive">*</span> : null}
      </FieldLabel>
      <Select
        value={field.state.value}
        onValueChange={field.handleChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={field.name}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          className="h-9 w-full bg-background text-xs"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-xs"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}

type DateFieldProps = {
  label: string
  required?: boolean
  disabled?: boolean
}

export function DateField({ label, required, disabled }: DateFieldProps) {
  const field = useFieldContext<string>()

  return (
    <DatePickerField
      id={field.name}
      label={label}
      required={required}
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      isInvalid={
        field.state.meta.isTouched && field.state.meta.errors.length > 0
      }
      errors={field.state.meta.errors}
      disabled={disabled}
    />
  )
}

type RadioPillOption<TValue extends string> = {
  value: TValue
  label: string
}

type RadioPillFieldProps<TValue extends string> = {
  label: string
  required?: boolean
  options: RadioPillOption<TValue>[]
  disabled?: boolean
  className?: string
}

export function RadioPillField<TValue extends string>({
  label,
  required,
  options,
  disabled,
  className,
}: RadioPillFieldProps<TValue>) {
  const field = useFieldContext<TValue>()

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-xs font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </span>
      <RadioGroup
        value={field.state.value}
        onValueChange={(value) => field.handleChange(value as TValue)}
        disabled={disabled}
        className="flex flex-row flex-wrap gap-2"
      >
        {options.map((option) => (
          <FieldLabel
            key={option.value}
            htmlFor={`${field.name}-${option.value}`}
            className="cursor-pointer gap-2 rounded-md border border-input px-4 py-2 text-xs font-medium text-foreground has-data-checked:border-primary has-data-checked:bg-primary/5 has-data-checked:text-primary"
          >
            <RadioGroupItem
              value={option.value}
              id={`${field.name}-${option.value}`}
            />
            {option.label}
          </FieldLabel>
        ))}
      </RadioGroup>
    </div>
  )
}

type SwitchFieldProps = {
  label: string
  onLabel: string
  offLabel: string
  disabled?: boolean
  className?: string
}

export function SwitchField({
  label,
  onLabel,
  offLabel,
  disabled,
  className,
}: SwitchFieldProps) {
  const field = useFieldContext<boolean>()

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="block text-xs font-medium text-foreground">{label}</span>
      <label className="flex h-9 cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
        <Switch
          checked={field.state.value}
          onCheckedChange={field.handleChange}
          disabled={disabled}
        />
        {field.state.value ? onLabel : offLabel}
      </label>
    </div>
  )
}
