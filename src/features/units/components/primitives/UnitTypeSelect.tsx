import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { unitTypeStyles } from "@/features/units/constants/unit-type-styles"
import { UnitType, unitTypeLabels } from "@/lib/types/unit.type"
import { cn } from "@/lib/utils"

const unitTypes = Object.values(UnitType)

const typeOptions = unitTypes.map((type) => ({
  value: type,
  label: unitTypeLabels[type],
}))

function UnitTypeLabel({ type }: { type: UnitType }) {
  const { icon: TypeIcon, tile } = unitTypeStyles[type]

  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md",
          tile
        )}
      >
        <TypeIcon className="size-3" />
      </span>
      {unitTypeLabels[type]}
    </span>
  )
}

type UnitTypeSelectProps = {
  id: string
  value: UnitType
  onChange: (type: UnitType) => void
  onBlur: () => void
  disabled?: boolean
  isInvalid?: boolean
}

// Select of the four unit types, each shown with its colored icon tile in both the trigger and the
// list — the shared SelectField only renders plain text labels.
export function UnitTypeSelect({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  isInvalid,
}: UnitTypeSelectProps) {
  return (
    <Select
      items={typeOptions}
      value={value}
      onValueChange={(next) => next !== null && onChange(next)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        onBlur={onBlur}
        aria-invalid={isInvalid}
        className="h-9 w-full bg-background text-xs"
      >
        <SelectValue>
          {(selected: UnitType | null) =>
            selected ? <UnitTypeLabel type={selected} /> : "Chọn loại đơn vị"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {unitTypes.map((type) => (
          <SelectItem key={type} value={type} className="text-xs">
            <UnitTypeLabel type={type} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
