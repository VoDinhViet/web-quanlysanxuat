import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Download, Plus, RotateCw, Search } from "lucide-react"
import { toast } from "sonner"

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
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { exportProductionOrders } from "@/features/production-orders/api/server-functions/export-production-orders.api"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"
import { productionOrderStatusLabels } from "@/lib/types/production-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { ProductionOrderStatus } from "@/lib/types/production-order.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(productionOrderStatusLabels),
]

export function ProductionOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/production-orders/" })
  const navigate = useNavigate({ from: "/manage/production-orders/" })
  const [q, setQ] = useState(search.q ?? "")

  const exportProductionOrdersFn = useServerFn(exportProductionOrders)
  const exportMutation = useMutation({
    mutationFn: () => exportProductionOrdersFn({ data: search }),
    onSuccess: ({ base64, filename }) => {
      downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      toast.success("Đã xuất file Excel")
    },
    onError: (error) => toast.error(error.message),
  })

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // OrdersTableFilter.tsx. An empty term becomes `undefined` so the search
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
    const status =
      value === "all" ? undefined : (value as ProductionOrderStatus)
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
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1.6fr)_minmax(16rem,1.6fr)_minmax(10rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="production-orders-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="production-orders-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo mã đơn hàng (SO)..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="production-orders-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày giao
            </Label>
            <DateRangePicker
              id="production-orders-date-range"
              from={search.dueDateFrom}
              to={search.dueDateTo}
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="production-orders-status"
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
                id="production-orders-status"
                className="w-full text-xs"
              >
                <SelectValue placeholder="Chọn trạng thái" />
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
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
          <PendingAction label="Tạo LSX" hint="Màn hình tạo LSX sắp có">
            <Plus className="size-4" />
            Tạo LSX
          </PendingAction>
        </div>
      </div>
    </div>
  )
}
