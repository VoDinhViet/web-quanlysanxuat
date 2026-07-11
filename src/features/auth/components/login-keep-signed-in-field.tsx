import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"

type LoginKeepSignedInFieldProps = {
  name: string
  checked: boolean
  disabled: boolean
  onBlur: () => void
  onChange: (checked: boolean) => void
}

export function LoginKeepSignedInField({
  name,
  checked,
  disabled,
  onBlur,
  onChange,
}: LoginKeepSignedInFieldProps) {
  return (
    <Field orientation="horizontal">
      <Checkbox
        id={name}
        name={name}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        onBlur={onBlur}
        disabled={disabled}
      />
      <FieldLabel
        htmlFor={name}
        className="cursor-pointer text-sm font-normal text-muted-foreground hover:text-foreground"
      >
        Ghi nhớ phiên đăng nhập
      </FieldLabel>
    </Field>
  )
}
