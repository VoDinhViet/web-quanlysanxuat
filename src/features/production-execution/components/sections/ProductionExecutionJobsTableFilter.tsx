import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
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
import { OperationSelect } from "@/features/production-execution/components/primitives/OperationSelect"
import { productionOperationSummaryQueryOptions } from "@/features/production-execution/api/options"
import { useGetClientOptions } from "@/features/clients/api"
import { productionJobStatusLabels } from "@/lib/types/production-job.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"
import type { ProductionJobStatus } from "@/lib/types/production-job.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(productionJobStatusLabels),
]

// Cùng khuôn ProductionJobsTableFilter.tsx — reset chỉ xoá filter, giữ nguyên `operationId` (thẻ
// công đoạn đang chọn ở panel 1 không phải một filter tuỳ chọn, đổi nó là đổi màn).
export function ProductionExecutionJobsTableFilter() {
  const search = useSearch({
    from: "/(authed)/manage_/production-execution/",
  })
  const navigate = useNavigate({ from: "/manage/production-execution/" })
  const [q, setQ] = useState(search.q ?? "")

  const client = useGetClientOptions()
  const selectedClient = client.clients.find(
    (option) => option.id === search.clientId
  )

  // Cùng query key với ProductionExecutionPage.tsx (dùng để tự chọn công đoạn đầu tiên) — React
  // Query dùng chung cache theo key, không gọi API 2 lần.
  const operationSummary = useQuery(
    productionOperationSummaryQueryOptions({
      q: search.q,
      status: search.status,
      clientId: search.clientId,
      dueDateFrom: search.dueDateFrom,
      dueDateTo: search.dueDateTo,
    })
  )

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
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1fr)_minmax(14rem,1.3fr)_minmax(11rem,1.1fr)_minmax(14rem,1.3fr)_minmax(9rem,0.9fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="production-execution-operation"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Công đoạn
            </Label>
            <OperationSelect
              summary={operationSummary.data ?? []}
              selectedOperationId={search.operationId}
              isPending={operationSummary.isPending}
              isError={operationSummary.isError}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="production-execution-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="production-execution-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo PO, Job, Sản phẩm..."
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
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="production-execution-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
            <ComboboxField
              id="production-execution-client"
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
              htmlFor="production-execution-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày giao hàng
            </Label>
            <DateRangePicker
              id="production-execution-date-range"
              from={search.dueDateFrom}
              to={search.dueDateTo}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="production-execution-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              selectedKey={search.status ?? "all"}
              onSelectionChange={(key) => handleStatusChange(String(key))}
            >
              <SelectTrigger
                id="production-execution-status"
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
