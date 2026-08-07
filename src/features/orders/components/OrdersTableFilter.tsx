import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, Plus, RotateCw, Search } from "lucide-react"

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
import { PermissionGate } from "@/components/shared/PermissionGate"
import {
  orderStatusLabels,
  OVERDUE_FILTER_VALUE,
  OVERDUE_LABEL,
  paymentTermLabels,
} from "@/lib/types/order.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { OrdersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import type { PaymentTerm } from "@/lib/types/order.type"

// "Trễ hạn" sits in the same select as the real statuses because it is the same
// question from the user's side ("show me which orders?"), even though the
// server function sends it as a separate `overdue` flag.
const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(orderStatusLabels),
  { value: OVERDUE_FILTER_VALUE, label: OVERDUE_LABEL },
]

const paymentTermFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(paymentTermLabels),
]

export function OrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/orders" })
  const navigate = useNavigate({ from: "/manage/orders" })
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

  const handlePaymentTermChange = (value: string) => {
    const paymentTerm = value === "all" ? undefined : (value as PaymentTerm)
    void navigate({ search: (prev) => ({ ...prev, paymentTerm, page: 1 }) })
  }

  const handleSalesRepChange = (value: string) => {
    const salesRepId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, salesRepId, page: 1 }) })
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
          paymentTerm: _paymentTerm,
          salesRepId: _salesRepId,
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
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="orders-search" />
              <div className="relative">
                <Input
                  id="orders-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm theo Mã SO, khách hàng, người liên hệ, SĐT..."
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
              <FilterLabel label="Ngày giao" htmlFor="orders-date-range" />
              <DateRangePicker
                id="orders-date-range"
                from={search.orderDateFrom}
                to={search.orderDateTo}
                onChange={handleDateRangeChange}
              />
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="orders-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
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

            <div className="space-y-1.5">
              <FilterLabel
                label="Điều khoản TT"
                htmlFor="orders-payment-term"
              />
              <Select
                value={search.paymentTerm ?? "all"}
                onValueChange={handlePaymentTermChange}
              >
                <SelectTrigger
                  id="orders-payment-term"
                  className="w-full text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* No backend endpoint exists for sales-rep options yet (confirmed:
                no `salesRep` anywhere in be-quanlysanxuat/src) — the select stays
                populated with only "Tất cả" until that ships. Not faked. */}
            <div className="space-y-1.5">
              <FilterLabel label="NV kinh doanh" htmlFor="orders-sales-rep" />
              <Select
                value={search.salesRepId ?? "all"}
                onValueChange={handleSalesRepChange}
              >
                <SelectTrigger id="orders-sales-rep" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
            <PendingAction
              label="Xuất Excel"
              hint="Tính năng xuất Excel sắp có"
            >
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
              Làm mới
            </Button>
            <PermissionGate permission="orders:create">
              <Button asChild className="text-xs">
                <Link to="/manage/orders/create">
                  <Plus className="size-4" />
                  Tạo đơn hàng
                </Link>
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
