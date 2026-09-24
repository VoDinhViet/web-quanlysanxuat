import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import {
  AltArrowDown,
  DocumentText,
  FileDownload,
  Magnifer,
  Restart,
} from "@solar-icons/react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
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

type ProductionJobsTableFilterProps = {
  selectedJobCount: number
  isExportingPlan: boolean
  onExportPlan: () => void
}

export function ProductionJobsTableFilter({
  selectedJobCount,
  isExportingPlan,
  onExportPlan,
}: ProductionJobsTableFilterProps) {
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

  const handleDateRangeChange = (
    dueDateFrom: string | undefined,
    dueDateTo: string | undefined
  ) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        dueDateFrom,
        dueDateTo,
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as ProductionJobStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const exportHint =
    selectedJobCount === 0
      ? "Tích chọn Job trong bảng để xuất"
      : "File tài liệu PDF"

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
              <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
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

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="production-jobs-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              items={statusFilterOptions}
              value={search.status ?? "all"}
              onValueChange={(value) =>
                value !== null && handleStatusChange(value)
              }
            >
              <SelectTrigger
                id="production-jobs-status"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PermissionGate permission="production:read">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    disabled={isExportingPlan}
                  >
                    {isExportingPlan ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileDownload className="size-4" />
                    )}
                    <span>Xuất</span>
                    <AltArrowDown className="size-3.5 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  Tùy chọn xuất dữ liệu
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  disabled={selectedJobCount === 0}
                  onClick={onExportPlan}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
                >
                  <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      Biểu mẫu kế hoạch sản xuất
                      {selectedJobCount > 0 && ` (${selectedJobCount} Job)`}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {exportHint}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGate>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <Restart className="size-4" />
            Làm mới
          </Button>
        </div>
      </div>
    </div>
  )
}
