import { DatePickerField } from "@/components/shared/DatePickerField"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"

type ProductionOrdersDateRangePatch = Pick<
  ProductionOrdersSearchSchema,
  "dueDateFrom" | "dueDateTo"
>

type ProductionOrdersDateRangeFilterProps = {
  from: string | undefined
  to: string | undefined
  onChange: (patch: ProductionOrdersDateRangePatch) => void
}

// Duplicated from orders/components/OrdersDateRangeFilter.tsx (only its second
// use — orders/code-quality.md holds abstraction until a third) with its own
// field: this filters `dueDate` directly, not `orderDate`.
export function ProductionOrdersDateRangeFilter({
  from,
  to,
  onChange,
}: ProductionOrdersDateRangeFilterProps) {
  // The schema can't enforce from <= to (a .superRefine has no `.catch()`, so a
  // bad URL pair would crash the route), so the range is clamped here instead.
  const handleFromChange = (next: string) => {
    const dueDateFrom = next || undefined
    const clearsTo = dueDateFrom && to && dueDateFrom > to

    onChange({ dueDateFrom, dueDateTo: clearsTo ? undefined : to })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePickerField
        id="production-orders-filter-date-from"
        label="Ngày giao từ"
        value={from ?? ""}
        onChange={handleFromChange}
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
      <DatePickerField
        id="production-orders-filter-date-to"
        label="Đến"
        value={to ?? ""}
        onChange={(next) =>
          onChange({ dueDateFrom: from, dueDateTo: next || undefined })
        }
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
    </div>
  )
}
