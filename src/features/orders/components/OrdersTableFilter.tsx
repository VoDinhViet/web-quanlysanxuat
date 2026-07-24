import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrdersDateRangeFilter } from "@/features/orders/components/OrdersDateRangeFilter"
import { OrdersFilterActions } from "@/features/orders/components/OrdersFilterActions"
import {
  ORDER_STATUS_LABELS,
  OVERDUE_FILTER_VALUE,
  OVERDUE_LABEL,
  PAYMENT_TERM_LABELS,
} from "@/features/orders/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import type {
  OrderFilterOption,
  PaymentTerm,
} from "@/features/orders/types/order.type"

const ALL_VALUE = "all"

// "Trễ hạn" sits in the same select as the real statuses because it is the same
// question from the user's side ("show me which orders?"), even though the
// server function sends it as a separate `overdue` flag.
const STATUS_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(ORDER_STATUS_LABELS),
  { value: OVERDUE_FILTER_VALUE, label: OVERDUE_LABEL },
]

const PAYMENT_TERM_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(PAYMENT_TERM_LABELS),
]

type OrdersTableFilterProps = {
  search: OrdersSearchSchema
  onFilterChange: (
    patch: Partial<OrdersSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  salesRepOptions: OrderFilterOption[]
}

export function OrdersTableFilter({
  search,
  onFilterChange,
  salesRepOptions,
}: OrdersTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — the same delay the
  // combobox option hooks use. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onFilterChange(
      { q: trimmed.length > 0 ? trimmed : undefined },
      { replace: true }
    )
  }, 300)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the
    // user just cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    onFilterChange({
      q: undefined,
      status: undefined,
      paymentTerm: undefined,
      salesRepId: undefined,
      orderDateFrom: undefined,
      orderDateTo: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          <label className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Tìm kiếm đơn hàng</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo Mã SO, khách hàng, người liên hệ, SĐT..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleSearch.flush()
                  }
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <div className="sm:col-span-2 xl:col-span-1">
            <OrdersDateRangeFilter
              from={search.orderDateFrom}
              to={search.orderDateTo}
              onChange={(patch) => onFilterChange(patch)}
            />
          </div>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  status:
                    next === ALL_VALUE
                      ? undefined
                      : (next as OrdersSearchSchema["status"]),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Điều khoản TT
            </span>
            <Select
              value={search.paymentTerm ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  paymentTerm:
                    next === ALL_VALUE ? undefined : (next as PaymentTerm),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_TERM_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              NV kinh doanh
            </span>
            <Select
              value={search.salesRepId ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  salesRepId: next === ALL_VALUE ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                {salesRepOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <OrdersFilterActions onReset={resetFilters} />
      </div>
    </div>
  )
}
