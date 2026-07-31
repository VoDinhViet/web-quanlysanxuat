import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComboboxField } from "@/components/shared/ComboboxField"
import { DateRangeFilter } from "@/components/shared/DateRangeFilter"
import { useGetClientOptions } from "@/features/clients/api"
import { PRODUCTION_JOB_STATUS_LABELS } from "@/lib/types/production-job.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"
import type { ProductionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"
import type { ClientRef } from "@/lib/types/client.type"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"

const ALL_VALUE = "all"

const STATUS_FILTER_OPTIONS = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(PRODUCTION_JOB_STATUS_LABELS),
]

type ProductionJobsTableFilterProps = {
  search: ProductionJobsSearchSchema
  onFilterChange: (
    patch: Partial<ProductionJobsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  clientOptions: ClientRef[]
}

export function ProductionJobsTableFilter({
  search,
  onFilterChange,
  clientOptions,
}: ProductionJobsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const client = useGetClientOptions()
  const selectedClient = clientOptions.find(
    (option) => option.id === search.clientId
  )

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // ProductionOrdersTableFilter.tsx. An empty term becomes `undefined` so the search
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
      clientId: undefined,
      dueDateFrom: undefined,
      dueDateTo: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(12rem,1.2fr)_minmax(16rem,1.6fr)_minmax(9rem,1fr)]">
          <label className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <span className="sr-only">Tìm kiếm Job</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm PO / Job / Mã SP / Tên SP..."
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

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Khách hàng
            </span>
            <ComboboxField
              value={search.clientId}
              onValueChange={(next) => onFilterChange({ clientId: next })}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isPending={client.isFetching}
              initialOption={buildSelectOption(selectedClient)}
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              className="text-xs"
            />
          </label>

          <div className="sm:col-span-2 xl:col-span-1">
            <DateRangeFilter
              idPrefix="production-jobs"
              fromLabel="Ngày giao từ"
              toLabel="Đến"
              from={search.dueDateFrom}
              to={search.dueDateTo}
              onChange={(range) =>
                onFilterChange({
                  dueDateFrom: range.from,
                  dueDateTo: range.to,
                })
              }
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
                      : (next as ProductionJobStatus),
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
        </div>

        <Button
          type="button"
          variant="outline"
          className="text-xs"
          onClick={resetFilters}
        >
          <RotateCw className="size-4" />
          Làm mới
        </Button>
      </div>
    </div>
  )
}
