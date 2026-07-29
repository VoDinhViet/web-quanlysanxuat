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
import { ProductionOrdersDateRangeFilter } from "@/features/production-orders/components/ProductionOrdersDateRangeFilter"
import { ProductionOrdersFilterActions } from "@/features/production-orders/components/ProductionOrdersFilterActions"
import { PRODUCTION_ORDER_STATUS_LABELS } from "@/lib/types/production-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { ProductionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"
import type { ProductionOrderStatus } from "@/lib/types/production-order.type"

// No "Tất cả" entry — GET /api/orders takes exactly one status, and there is no
// value that would mean "both AWAITING_PRODUCTION and IN_PROGRESS at once".
const STATUS_FILTER_OPTIONS = buildOptionsFromLabels(
  PRODUCTION_ORDER_STATUS_LABELS
)

type ProductionOrdersTableFilterProps = {
  search: ProductionOrdersSearchSchema
  onFilterChange: (
    patch: Partial<ProductionOrdersSearchSchema>,
    options?: { replace?: boolean }
  ) => void
}

export function ProductionOrdersTableFilter({
  search,
  onFilterChange,
}: ProductionOrdersTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // OrdersTableFilter.tsx. An empty term becomes `undefined` so the search
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
      dueDateFrom: undefined,
      dueDateTo: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1.6fr)_minmax(16rem,1.6fr)_minmax(10rem,1fr)]">
          <label className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Tìm kiếm lệnh sản xuất</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo mã đơn hàng (SO)..."
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
            <ProductionOrdersDateRangeFilter
              from={search.dueDateFrom}
              to={search.dueDateTo}
              onChange={(patch) => onFilterChange(patch)}
            />
          </div>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status}
              onValueChange={(next) =>
                onFilterChange({ status: next as ProductionOrderStatus })
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
        </div>

        <ProductionOrdersFilterActions onReset={resetFilters} />
      </div>
    </div>
  )
}
