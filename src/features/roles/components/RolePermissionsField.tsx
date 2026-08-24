import { useField } from "@tanstack/react-form"
import type { AnyFormApi } from "@tanstack/react-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { permissionGroups, permissionLabels } from "@/lib/types/permission.type"
import type { PermissionCode } from "@/lib/types/permission.type"

type RolePermissionsFieldProps = {
  form: AnyFormApi
  disabled?: boolean
}

/** Checkbox matrix over every `permissionGroups` resource group, wired straight to the form's
 *  `permissions` array field — shared by CreateRoleForm and UpdateRoleForm. */
export function RolePermissionsField({
  form,
  disabled,
}: RolePermissionsFieldProps) {
  const field = useField({ form, name: "permissions" })
  const selected: PermissionCode[] = field.state.value
  const selectedSet = new Set(selected)

  function toggle(code: PermissionCode, checked: boolean) {
    field.handleChange(
      checked ? [...selected, code] : selected.filter((value) => value !== code)
    )
  }

  return (
    <Field data-invalid={field.state.meta.errors.length > 0}>
      <FieldLabel className="text-xs font-medium text-foreground">
        Quyền hạn <span className="text-destructive">*</span>
      </FieldLabel>
      <div className="space-y-4 rounded-md border border-border p-4">
        {permissionGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {group.codes.map((code) => (
                <label
                  key={code}
                  className="flex items-center gap-2 text-xs text-foreground"
                >
                  <Checkbox
                    checked={selectedSet.has(code)}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      toggle(code, checked === true)
                    }
                  />
                  {permissionLabels[code]}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <FieldError errors={field.state.meta.errors} />
    </Field>
  )
}
