import { DatePickerField } from "@/components/shared/DatePickerField"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

type OrdersDateRangePatch = Pick<
  OrdersSearchSchema,
  "orderDateFrom" | "orderDateTo"
>

type OrdersDateRangeFilterProps = {
  from: string | undefined
  to: string | undefined
  onChange: (patch: OrdersDateRangePatch) => void
}

// Two single pickers rather than a native <input type="date">: native date
// inputs render in the browser/OS locale, so a machine set to en-US would show
// mm/dd/yyyy on a page where every other date reads dd/MM/yyyy.
//
// DatePickerField is form-shaped (onBlur/isInvalid/errors are required), but its
// sibling ComboboxField is already documented as usable in table filters, so the
// three inert props are the accepted cost.
export function OrdersDateRangeFilter({
  from,
  to,
  onChange,
}: OrdersDateRangeFilterProps) {
  // The schema can't enforce from <= to (a .superRefine has no `.catch()`, so a
  // bad URL pair would crash the route), so the range is clamped here instead.
  const handleFromChange = (next: string) => {
    const orderDateFrom = next || undefined
    const clearsTo = orderDateFrom && to && orderDateFrom > to

    onChange({ orderDateFrom, orderDateTo: clearsTo ? undefined : to })
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePickerField
        id="orders-filter-date-from"
        label="Đặt hàng từ"
        value={from ?? ""}
        onChange={handleFromChange}
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
      <DatePickerField
        id="orders-filter-date-to"
        label="Đến"
        value={to ?? ""}
        onChange={(next) =>
          onChange({ orderDateFrom: from, orderDateTo: next || undefined })
        }
        onBlur={() => {}}
        isInvalid={false}
        errors={[]}
      />
    </div>
  )
}
