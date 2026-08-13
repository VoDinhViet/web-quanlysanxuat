import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, RotateCw, Search } from "lucide-react"

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
import { DateRangePicker } from "@/components/shared/DateRangePicker"
import { FilterLabel } from "@/components/shared/FilterLabel"
import { PendingAction } from "@/components/shared/PendingAction"
import type { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import { paymentRequestStatusLabels } from "@/lib/types/payment-request.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(paymentRequestStatusLabels),
]

export function PaymentRequestsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/payment-requests" })
  const navigate = useNavigate({ from: "/manage/payment-requests" })
  const [q, setQ] = useState(search.q ?? "")

  // Debounced search — 300ms after last keystroke, same idiom as OrdersTableFilter.
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
      value === "all" ? undefined : (value as PaymentRequestStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
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

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          supplierId: _supplierId,
          poCode: _poCode,
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_minmax(14rem,1.5fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
            {/* Từ ngày / Đến ngày */}
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <FilterLabel label="Từ ngày – Đến ngày" htmlFor="pr-date-range" />
              <DateRangePicker
                id="pr-date-range"
                from={search.fromDate}
                to={search.toDate}
                onChange={handleDateRangeChange}
              />
            </div>

            {/* Tìm kiếm mã YCTT / Mã PO */}
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="pr-search" />
              <div className="relative">
                <Input
                  id="pr-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Mã YCTT, Mã PO..."
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

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="pr-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="pr-status" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
            <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
              <Download className="size-4" />
              Xuất Excel
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
