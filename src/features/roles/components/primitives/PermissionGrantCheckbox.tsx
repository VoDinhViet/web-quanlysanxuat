import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

type PermissionGrantCheckboxProps = {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
}

/** Tri-state checkbox reused at every level a role's permissions can be granted in bulk —
 *  a single action column, a whole business block, one module's "Tất cả", or every
 *  permission at once — so the same gesture means the same thing everywhere in the matrix. */
export function PermissionGrantCheckbox({
  checked,
  indeterminate = false,
  disabled,
  onCheckedChange,
  label,
  className,
}: PermissionGrantCheckboxProps) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className={cn("size-4.5", className)}
    />
  )
}
