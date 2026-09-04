import { useField } from "@tanstack/react-form"
import type { AnyFormApi } from "@tanstack/react-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { unitScopeLabels } from "@/lib/types/unit.type"
import type { UnitScope } from "@/lib/types/unit.type"

const SCOPES: UnitScope[] = ["MATERIAL", "PRODUCT"]

type UnitScopesFieldProps = {
  form: AnyFormApi
  disabled?: boolean
}

/** Checkbox pair over the two scopes the admin screen offers — wired straight to the form's
 *  `scopes` array field — shared by CreateUnitForm and UpdateUnitForm. */
export function UnitScopesField({ form, disabled }: UnitScopesFieldProps) {
  const field = useField({ form, name: "scopes" })
  const selected: UnitScope[] = field.state.value
  const selectedSet = new Set(selected)

  function toggle(scope: UnitScope, checked: boolean) {
    field.handleChange(
      checked
        ? [...selected, scope]
        : selected.filter((value) => value !== scope)
    )
  }

  return (
    <Field data-invalid={field.state.meta.errors.length > 0}>
      <FieldLabel className="text-xs font-medium text-foreground">
        Phạm vi sử dụng <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-md border border-border p-4">
        {SCOPES.map((scope) => (
          <Checkbox
            key={scope}
            className="flex items-center gap-2 text-xs text-foreground"
            isSelected={selectedSet.has(scope)}
            isDisabled={disabled}
            onChange={(checked) => toggle(scope, checked)}
          >
            {unitScopeLabels[scope]}
          </Checkbox>
        ))}
      </div>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}
