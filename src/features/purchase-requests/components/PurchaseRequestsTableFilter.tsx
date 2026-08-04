import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
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
import { DateRangeFilter } from "@/components/shared/DateRangeFilter"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { PurchaseRequestsFilterActions } from "@/features/purchase-requests/components/PurchaseRequestsFilterActions"
import { PURCHASE_REQUEST_STATUS_LABELS } from "@/lib/types/purchase-request.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { PurchaseRequestsSearchSchema } from "@/features/purchase-requests/schemas/purchase-requests-search.schema"
import type { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

const ALL_VALUE = "all"

const STATUS_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(PURCHASE_REQUEST_STATUS_LABELS),
]

type PurchaseRequestsTableFilterProps = {
  search: PurchaseRequestsSearchSchema
  onFilterChange: (
    patch: Partial<PurchaseRequestsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
}

export function PurchaseRequestsTableFilter({
  search,
  onFilterChange,
}: PurchaseRequestsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  // Reference list with a fixed key — the loader already prefetched it, resolves synchronously.
  const { data: departments } = useSuspenseQuery(
    departmentOptionsQueryOptions()
  )
  const departmentOptions = [
    { value: ALL_VALUE, label: "Tất cả" },
    ...buildSelectOptions(departments),
  ]

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // ProductionJobsTableFilter.tsx. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely. The "Bộ lọc" button and
  // Enter both call `.flush()` to apply immediately without waiting out the debounce.
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
      departmentId: undefined,
      createdDateFrom: undefined,
      createdDateTo: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(16rem,1.6fr)_minmax(10rem,1fr)_minmax(14rem,1.4fr)]">
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
                      : (next as PurchaseRequestStatus),
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

          <div className="sm:col-span-2 xl:col-span-1">
            <DateRangeFilter
              idPrefix="purchase-requests"
              fromLabel="Từ ngày"
              toLabel="Đến ngày"
              from={search.createdDateFrom}
              to={search.createdDateTo}
              onChange={(range) =>
                onFilterChange({
                  createdDateFrom: range.from,
                  createdDateTo: range.to,
                })
              }
            />
          </div>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Bộ phận
            </span>
            <Select
              value={search.departmentId ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  departmentId: next === ALL_VALUE ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Tìm kiếm đề xuất mua hàng</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm: Mã PR, PO, Job, Vật tư..."
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
        </div>

        <PurchaseRequestsFilterActions
          onApplySearch={() => handleSearch.flush()}
          onReset={resetFilters}
        />
      </div>
    </div>
  )
}
