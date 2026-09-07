import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Download, Plus, Printer, RotateCw, Search } from "lucide-react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
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
import { exportOutboundOrders } from "@/features/outbound-orders/api/server-functions/export-outbound-orders.api"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"
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

  const exportOutboundOrdersFn = useServerFn(exportOutboundOrders)
  const exportMutation = useMutation({
    mutationFn: () => exportOutboundOrdersFn({ data: search }),
    onSuccess: ({ base64, filename }) => {
      downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      toast.success("Đã xuất file Excel")
    },
    onError: (error) => toast.error(error.message),
  })

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

  const handleDateRangeChange = (
    startDate: string | undefined,
    endDate: string | undefined
  ) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate,
        endDate,
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

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="do-status"
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

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="do-fulfillment-type"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Hình thức giao
            </Label>
            <Select
              items={fulfillmentTypeFilterOptions}
              value={search.fulfillmentType ?? "all"}
              onValueChange={(value) =>
                value !== null && handleFulfillmentTypeChange(value)
              }
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
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            <Download className="size-4" />
            {exportMutation.isPending ? "Đang xuất..." : "Xuất Excel"}
          </Button>

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
            <LinkButton to="/manage/outbound-orders/create" className="text-xs">
              <Plus className="size-4" />
              Tạo DO mới
            </LinkButton>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
