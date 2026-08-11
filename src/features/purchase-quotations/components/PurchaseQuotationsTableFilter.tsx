import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Filter, Plus, RotateCw, Search } from "lucide-react"

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
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { purchaseQuotationStatusLabels } from "@/lib/types/purchase-quotation.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(purchaseQuotationStatusLabels),
]

export function PurchaseQuotationsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/purchase-quotations" })
  const navigate = useNavigate({ from: "/manage/purchase-quotations" })
  const [q, setQ] = useState(search.q ?? "")

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: suppliers } = useSuspenseQuery(supplierOptionsQueryOptions())
  const supplierFilterOptions = [
    { value: "all", label: "Tất cả" },
    ...buildSelectOptions(suppliers),
  ]

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // PurchaseOrdersTableFilter.tsx. The "Bộ lọc" button and Enter both call `.flush()` to apply
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
      value === "all" ? undefined : (value as PurchaseQuotationStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const handleQuotationDateRangeChange = (range: {
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
    // Cancel first: a debounced call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          supplierId: _supplierId,
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
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(11rem,1fr)_minmax(14rem,1.3fr)_minmax(14rem,1.4fr)]">
            <div className="space-y-1.5">
              <FilterLabel
                label="Trạng thái"
                htmlFor="purchase-quotations-status"
              />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger
                  id="purchase-quotations-status"
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

            <div className="space-y-1.5">
              <FilterLabel label="NCC" htmlFor="purchase-quotations-supplier" />
              <Select
                value={search.supplierId ?? "all"}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger
                  id="purchase-quotations-supplier"
                  className="w-full text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supplierFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FilterLabel
                label="Ngày lập"
                htmlFor="purchase-quotations-date-range"
              />
              <DateRangePicker
                id="purchase-quotations-date-range"
                from={search.fromDate}
                to={search.toDate}
                onChange={handleQuotationDateRangeChange}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <FilterLabel
                label="Tìm kiếm"
                htmlFor="purchase-quotations-search"
              />
              <div className="relative">
                <Input
                  id="purchase-quotations-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm theo mã RFQ..."
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

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
            {/* Select/DateRangePicker already apply live on change (app-wide convention) — this
                only flushes the search box's 300ms debounce immediately, same effect as pressing
                Enter in it. */}
            <Button
              type="button"
              variant="outline"
              className="text-xs"
              onClick={() => handleSearch.flush()}
            >
              <Filter className="size-4" />
              Bộ lọc
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

            <Button asChild className="text-xs">
              <Link to="/manage/purchase-quotations/create">
                <Plus className="size-4" />
                Tạo RFQ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
