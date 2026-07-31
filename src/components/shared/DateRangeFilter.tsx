import { DatePickerField } from "@/components/shared/DatePickerField"

type DateRange = { from: string | undefined; to: string | undefined }

type DateRangeFilterProps = {
  idPrefix: string
  fromLabel: string
  toLabel: string
  from: string | undefined
  to: string | undefined
  onChange: (range: DateRange) => void
}

// Two single pickers rather than a native <input type="date">: native date
// inputs render in the browser/OS locale, so a machine set to en-US would show
// mm/dd/yyyy on a page where every other date reads dd/MM/yyyy.
//
// DatePickerField is form-shaped (onBlur/isInvalid/errors are required), but its
// sibling ComboboxField is already documented as usable in table filters, so the
// three inert props are the accepted cost.
//
// Promoted here from orders/OrdersDateRangeFilter.tsx + production-orders/
// ProductionOrdersDateRangeFilter.tsx once production-jobs became a third,
// identical use — see .claude/rules/code-quality.md ("no abstraction until the
// third use"). The prop shape is deliberately `{from, to}` rather than a search
// schema's own field names, since each caller filters a different date field
// (orderDate / dueDate) — mapping to the caller's own patch shape happens at
// the call site.
export function DateRangeFilter({
  idPrefix,
  fromLabel,
  toLabel,
  from,
  to,
  onChange,
}: DateRangeFilterProps) {
  // The schema can't enforce from <= to (a .superRefine has no `.catch()`, so a
  // bad URL pair would crash the route), so the range is clamped here instead.
  const handleFromChange = (next: string) => {
    const nextFrom = next || undefined
    const clearsTo = nextFrom && to && nextFrom > to

    onChange({ from: nextFrom, to: clearsTo ? undefined : to })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePickerField
        id={`${idPrefix}-filter-date-from`}
        label={fromLabel}
        value={from ?? ""}
        onChange={handleFromChange}
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
      <DatePickerField
        id={`${idPrefix}-filter-date-to`}
        label={toLabel}
        value={to ?? ""}
        onChange={(next) => onChange({ from, to: next || undefined })}
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
    </div>
  )
}
