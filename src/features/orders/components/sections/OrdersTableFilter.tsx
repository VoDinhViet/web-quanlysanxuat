import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Loader2, Plus, RotateCw, Search } from "lucide-react"
import {
  AltArrowDown,
  DocumentText,
  File,
  FileDownload,
  Printer,
} from "@solar-icons/react"
import { toast } from "sonner"

import { Button, LinkButton } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
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

type OrdersTableFilterProps = {
  selectedOrderCount?: number
  onExportOrdersForm?: () => void
  onPrintOrdersForm?: () => void
  onExportOrdersExcel?: () => void
  onClearSelection?: () => void
  isExportingForm?: boolean
  isPrintingForm?: boolean
  isExportingExcel?: boolean
}

export function OrdersTableFilter({
  selectedOrderCount = 0,
  onExportOrdersForm,
  onPrintOrdersForm,
  onExportOrdersExcel,
  onClearSelection,
  isExportingForm = false,
  isPrintingForm = false,
  isExportingExcel = false,
}: OrdersTableFilterProps) {
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

  const handleDateRangeChange = (
    orderDateFrom: string | undefined,
    orderDateTo: string | undefined
  ) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        orderDateFrom,
        orderDateTo,
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
    onClearSelection?.()
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

  const hasSelectedOrders = selectedOrderCount > 0
  const isExporting = isExportingForm || isPrintingForm || isExportingExcel

  const handleExportFormClick = () => {
    if (!hasSelectedOrders) {
      toast.info("Vui lòng tích chọn đơn hàng trên bảng để xuất biểu mẫu", {
        description:
          "Bạn có thể tích chọn từng dòng hoặc chọn ô vuông ở đầu bảng để chọn toàn bộ trang này.",
      })
      return
    }
    onExportOrdersForm?.()
  }

  const handlePrintFormClick = () => {
    if (!hasSelectedOrders) {
      toast.info("Vui lòng tích chọn đơn hàng trên bảng để in biểu mẫu", {
        description:
          "Bạn có thể tích chọn từng dòng hoặc chọn ô vuông ở đầu bảng để chọn toàn bộ trang này.",
      })
      return
    }
    onPrintOrdersForm?.()
  }

  const handleExportExcelClick = () => {
    if (!hasSelectedOrders) {
      toast.info("Vui lòng tích chọn đơn hàng trên bảng để xuất Excel", {
        description:
          "Bạn có thể tích chọn từng dòng hoặc chọn ô vuông ở đầu bảng để chọn toàn bộ trang này.",
      })
      return
    }
    onExportOrdersExcel?.()
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
                placeholder="Tìm theo Mã SO, tên/mã KH, tên/mã sản phẩm..."
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

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="orders-status"
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
              <SelectTrigger id="orders-status" className="w-full text-xs">
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

          {/* NV kinh doanh is a visual placeholder — no backend endpoint exists for
                assigned-user options yet (confirmed: GET /api/users has no options endpoint), so
                the filter is disabled until that ships. Not faked. Same pattern as "Khu vực" in
                ClientsTableFilter.tsx. */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="orders-assigned-user"
              className="text-[11px] font-medium text-muted-foreground"
            >
              NV kinh doanh
            </Label>
            <Select
              items={[{ value: "all", label: "Tất cả" }]}
              value="all"
              disabled
            >
              <SelectTrigger
                id="orders-assigned-user"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <PermissionGate permission="orders:read">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={
                      hasSelectedOrders
                        ? "border-primary/50 bg-primary/5 text-xs font-medium text-primary shadow-2xs hover:bg-primary/10"
                        : "text-xs text-muted-foreground hover:text-foreground"
                    }
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="size-4 animate-spin text-emerald-600" />
                    ) : (
                      <FileDownload className="size-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span>Xuất</span>
                    {hasSelectedOrders && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        {selectedOrderCount}
                      </span>
                    )}
                    <AltArrowDown className="size-3.5 opacity-60" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
                  {hasSelectedOrders
                    ? `Xuất ${selectedOrderCount} đơn hàng đã chọn`
                    : "Tùy chọn xuất dữ liệu"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  disabled={isExportingForm}
                  onClick={handleExportFormClick}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
                >
                  <DocumentText className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      Biểu mẫu đơn hàng (BM-03/KD)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      File tài liệu PDF
                      {hasSelectedOrders ? ` (${selectedOrderCount} đơn)` : ""}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isPrintingForm}
                  onClick={handlePrintFormClick}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
                >
                  <Printer className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      In biểu mẫu (BM-03/KD)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      In trực tiếp
                      {hasSelectedOrders ? ` (${selectedOrderCount} đơn)` : ""}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isExportingExcel}
                  onClick={handleExportExcelClick}
                  className="flex cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 hover:bg-muted/80"
                >
                  <File className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      Danh sách đơn hàng
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Bảng tính Excel (.xlsx)
                      {hasSelectedOrders ? ` (${selectedOrderCount} đơn)` : ""}
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
