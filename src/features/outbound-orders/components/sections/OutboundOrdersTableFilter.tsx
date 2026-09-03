import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { FileSpreadsheet, Plus, Printer, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComboboxField } from "@/components/shared/composites/ComboboxField"
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { useGetClientOptions } from "@/features/clients/api"
import {
  fulfillmentTypeLabels,
  outboundOrderStatusLabels,
} from "@/lib/types/outbound-order.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"
import type {
  FulfillmentType,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(outboundOrderStatusLabels),
]

const fulfillmentTypeFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(fulfillmentTypeLabels),
]

export function OutboundOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders/" })
  const navigate = useNavigate({ from: "/manage/outbound-orders/" })

  const [q, setQ] = useState(search.q ?? "")

  // Unlike production-jobs.tsx, this route's loader doesn't prefetch client options — so a
  // `clientId` already in the URL gets its label from `client.clients` once this hook's own
  // q="" query resolves, not on first render.
  const client = useGetClientOptions()
  const selectedClient = client.clients.find(
    (option) => option.id === search.clientId
  )

  const handleSearchDebounced = useDebounceCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: q.trim().length > 0 ? q.trim() : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleExecuteSearch = () => {
    handleSearchDebounced.flush()
  }

  const handleClientChange = (value: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, clientId: value, page: 1 }),
    })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as OutboundOrderStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleFulfillmentTypeChange = (value: string) => {
    const fulfillmentType =
      value === "all" ? undefined : (value as FulfillmentType)
    void navigate({
      search: (prev) => ({ ...prev, fulfillmentType, page: 1 }),
    })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
    handleSearchDebounced.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          clientId: _clientId,
          status: _status,
          fulfillmentType: _fulfillmentType,
          startDate: _startDate,
          endDate: _endDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(11rem,1fr)_minmax(14rem,1.3fr)_minmax(9rem,0.9fr)_minmax(9rem,0.9fr)_minmax(13rem,1.2fr)]">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="do-q"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="do-q"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Mã DO..."
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  handleSearchDebounced()
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleExecuteSearch()
                  }
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="do-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
            <ComboboxField
              id="do-client"
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

          <div className="space-y-1.5">
            <Label
              htmlFor="do-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="do-status" className="w-full text-xs">
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

          <div className="space-y-1.5">
            <Label
              htmlFor="do-fulfillment-type"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Hình thức giao
            </Label>
            <Select
              value={search.fulfillmentType ?? "all"}
              onValueChange={handleFulfillmentTypeChange}
            >
              <SelectTrigger
                id="do-fulfillment-type"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fulfillmentTypeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="do-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày giao
            </Label>
            <DateRangePicker
              id="do-date-range"
              from={search.startDate}
              to={search.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
            <FileSpreadsheet className="size-4 text-emerald-600" />
            Xuất Excel
          </PendingAction>

          <PendingAction
            label="In danh sách"
            hint="Tính năng in danh sách sắp có"
          >
            <Printer className="size-4 text-muted-foreground" />
            In danh sách
          </PendingAction>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Xóa bộ lọc
          </Button>

          <RoutePermissionGate route="/manage/outbound-orders/create">
            <Button asChild className="text-xs">
              <Link to="/manage/outbound-orders/create">
                <Plus className="size-4" />
                Tạo DO mới
              </Link>
            </Button>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
