import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

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
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { purchaseRequestStatusLabels } from "@/lib/types/purchase-request.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(purchaseRequestStatusLabels),
]

export function PurchaseRequestsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/purchase-requests/" })
  const navigate = useNavigate({ from: "/manage/purchase-requests/" })
  const [q, setQ] = useState(search.q ?? "")

  // Reference list with a fixed key — the loader already prefetched it, resolves synchronously.
  const { data: departments } = useSuspenseQuery(
    departmentOptionsQueryOptions()
  )
  const departmentOptions = [
    { value: "all", label: "Tất cả" },
    ...buildSelectOptions(departments),
  ]

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // ProductionJobsTableFilter.tsx. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely. Enter calls `.flush()` to apply
  // immediately without waiting out the debounce.
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

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as PurchaseRequestStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        createdStartDate: range.from,
        createdEndDate: range.to,
        page: 1,
      }),
    })
  }

  const handleDepartmentChange = (value: string) => {
    const departmentId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, departmentId, page: 1 }) })
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
          departmentId: _departmentId,
          createdStartDate: _createdStartDate,
          createdEndDate: _createdEndDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(16rem,1.6fr)_minmax(10rem,1fr)_minmax(14rem,1.4fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-requests-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger
                id="purchase-requests-status"
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

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="purchase-requests-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày tạo
            </Label>
            <DateRangePicker
              id="purchase-requests-date-range"
              from={search.createdStartDate}
              to={search.createdEndDate}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-requests-department"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Bộ phận
            </Label>
            <Select
              value={search.departmentId ?? "all"}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger
                id="purchase-requests-department"
                className="w-full text-xs"
              >
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
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="purchase-requests-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="purchase-requests-search"
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
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>

          <RoutePermissionGate route="/manage/purchase-requests/create">
            <Button asChild className="text-xs">
              <Link to="/manage/purchase-requests/create">
                <Plus className="size-4" />
                Tạo đề xuất mua hàng (Manual)
              </Link>
            </Button>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
