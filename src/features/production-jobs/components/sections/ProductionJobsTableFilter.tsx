import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
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
import { Label } from "@/components/ui/label"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { useGetClientOptions } from "@/features/clients/api"
import { productionJobStatusLabels } from "@/lib/types/production-job.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(productionJobStatusLabels),
]

export function ProductionJobsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/production-jobs/" })
  const navigate = useNavigate({ from: "/manage/production-jobs/" })
  const [q, setQ] = useState(search.q ?? "")

  // The route loader prefetches this hook's own q="" query, so `client.clients`
  // already has data on first render — no separate suspense query needed just
  // to seed the combobox's selected-label.
  const client = useGetClientOptions()
  const selectedClient = client.clients.find(
    (option) => option.id === search.clientId
  )

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // ProductionOrdersTableFilter.tsx. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleClientChange = (value: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, clientId: value, page: 1 }),
    })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        dueDateFrom: range.from,
        dueDateTo: range.to,
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as ProductionJobStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the
    // user just cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          clientId: _clientId,
          dueDateFrom: _dueDateFrom,
          dueDateTo: _dueDateTo,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(12rem,1.2fr)_minmax(16rem,1.6fr)_minmax(9rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="production-jobs-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="production-jobs-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm PO / Job / Mã SP / Tên SP..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="production-jobs-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
            <ComboboxField
              id="production-jobs-client"
              value={search.clientId}
              onValueChange={handleClientChange}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isPending={client.isFetching}
              initialOption={buildSelectOption(selectedClient)}
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="production-jobs-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày giao
            </Label>
            <DateRangePicker
              id="production-jobs-date-range"
              from={search.dueDateFrom}
              to={search.dueDateTo}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="production-jobs-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onChange={(key) => handleStatusChange(String(key))}
            >
              <SelectTrigger
                id="production-jobs-status"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} id={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
