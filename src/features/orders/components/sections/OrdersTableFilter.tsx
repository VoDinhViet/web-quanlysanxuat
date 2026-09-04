import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, Plus, RotateCw, Search } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { orderStatusLabels } from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"

// No "Trễ hạn" entry — the backend's GetOrdersReqDto has no `overdue` filter, only the
// `expired` flag on each row (see OrderStatusBadge for where that still shows up).
const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(orderStatusLabels),
]

export function OrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/orders/" })
  const navigate = useNavigate({ from: "/manage/orders/" })
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — the same delay the
  // combobox option hooks use. An empty term becomes `undefined` so the search
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

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        orderDateFrom: range.from,
        orderDateTo: range.to,
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as OrdersSearchSchema["status"])
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
          assignedUserId: _assignedUserId,
          orderDateFrom: _orderDateFrom,
          orderDateTo: _orderDateTo,
          order: _order,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="orders-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="orders-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo Mã SO..."
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

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="orders-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày giao
            </Label>
            <DateRangePicker
              id="orders-date-range"
              from={search.orderDateFrom}
              to={search.orderDateTo}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="orders-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              selectedKey={search.status ?? "all"}
              onSelectionChange={(key) => handleStatusChange(String(key))}
            >
              <SelectTrigger id="orders-status" className="w-full text-xs">
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

          {/* NV kinh doanh is a visual placeholder — no backend endpoint exists for
                assigned-user options yet (confirmed: GET /api/users has no options endpoint), so
                the filter is disabled until that ships. Not faked. Same pattern as "Khu vực" in
                ClientsTableFilter.tsx. */}
          <div className="space-y-1.5">
            <Label
              htmlFor="orders-assigned-user"
              className="text-[11px] font-medium text-muted-foreground"
            >
              NV kinh doanh
            </Label>
            <Select selectedKey="all" isDisabled>
              <SelectTrigger
                id="orders-assigned-user"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
            <Download className="size-4" />
            Xuất Excel
          </PendingAction>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onPress={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
          <RoutePermissionGate route="/manage/orders/create">
            <LinkButton to="/manage/orders/create" className="text-xs">
              <Plus className="size-4" />
              Tạo đơn hàng
            </LinkButton>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
