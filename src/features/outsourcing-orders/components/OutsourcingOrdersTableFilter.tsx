import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { PermissionGate } from "@/components/shared/PermissionGate"
import type { OutsourcingOrderStatus } from "@/lib/types/outsourcing-order.type"
import { outsourcingOrderStatusLabels } from "@/lib/types/outsourcing-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(outsourcingOrderStatusLabels),
]

export function OutsourcingOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-orders" })
  const navigate = useNavigate({ from: "/manage/outsourcing-orders" })

  const [q, setQ] = useState(search.q ?? "")

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

  const handleStatusChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        status: value === "all" ? undefined : (value as OutsourcingOrderStatus),
        page: 1,
      }),
    })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        fromDate: range.from,
        toDate: range.to,
        page: 1,
      }),
    })
  }

  const handleExecuteSearch = () => {
    handleSearchDebounced.flush()
  }

  const resetFilters = () => {
    handleSearchDebounced.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          fromDate: _fromDate,
          toDate: _toDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-4">
          <PermissionGate permission="outsourcing:create">
            <Button asChild className="gap-1.5">
              <Link to="/manage/outsourcing-orders/create">
                <Plus className="size-4" />
                Tạo phiếu gia công ngoài (OS-OUT)
              </Link>
            </Button>
          </PermissionGate>

          <PermissionGate permission="outsourcing:read">
            <Button asChild variant="outline" className="gap-1.5">
              <Link
                to="/manage/outsourcing-receipts"
                search={{ page: 1, limit: 10 }}
              >
                <Upload className="size-4" />
                Nhập hàng về (OS-IN)
              </Link>
            </Button>
          </PermissionGate>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="os-out-q" />
              <div className="relative">
                <Input
                  id="os-out-q"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Mã phiếu..."
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
              <FilterLabel label="Trạng thái" htmlFor="os-out-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="os-out-status" className="w-full text-xs">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <FilterLabel
                label="Từ ngày – Đến ngày"
                htmlFor="os-out-daterange"
              />
              <DateRangePicker
                id="os-out-daterange"
                from={search.fromDate}
                to={search.toDate}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5 text-xs"
              onClick={resetFilters}
            >
              <RotateCw className="size-3.5" />
              Xóa bộ lọc
            </Button>
            <Button
              type="button"
              className="gap-1.5 text-xs"
              onClick={handleExecuteSearch}
            >
              <Search className="size-3.5" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
