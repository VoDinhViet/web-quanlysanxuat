import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

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
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { purchaseOrderProgressLabels } from "@/lib/types/purchase-order.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"
import type { PurchaseOrderProgress } from "@/lib/types/purchase-order.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(purchaseOrderProgressLabels),
]

export function PurchaseOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/purchase-orders/" })
  const navigate = useNavigate({ from: "/manage/purchase-orders/" })
  const [q, setQ] = useState(search.q ?? "")

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: suppliers } = useSuspenseQuery(supplierOptionsQueryOptions())
  const supplierFilterOptions = [
    { value: "all", label: "Tất cả" },
    ...buildSelectOptions(suppliers),
  ]

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // PurchaseLedgerTableFilter.tsx.
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

  const handleProgressChange = (value: string) => {
    const progress =
      value === "all" ? undefined : (value as PurchaseOrderProgress)
    void navigate({ search: (prev) => ({ ...prev, progress, page: 1 }) })
  }

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const handleOrderDateRangeChange = (range: {
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
    // Cancel first: a debounced call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          progress: _progress,
          supplierId: _supplierId,
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
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(11rem,1fr)_minmax(14rem,1.3fr)_minmax(14rem,1.4fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-orders-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.progress ?? "all"}
              onChange={(key) => handleProgressChange(String(key))}
            >
              <SelectTrigger
                id="purchase-orders-status"
                className="w-full text-xs"
              >
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

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-orders-supplier"
              className="text-[11px] font-medium text-muted-foreground"
            >
              NCC
            </Label>
            <Select
              value={search.supplierId ?? "all"}
              onChange={(key) => handleSupplierChange(String(key))}
            >
              <SelectTrigger
                id="purchase-orders-supplier"
                className="w-full text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supplierFilterOptions.map((option) => (
                  <SelectItem key={option.value} id={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-orders-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày đặt
            </Label>
            <DateRangePicker
              id="purchase-orders-date-range"
              from={search.startDate}
              to={search.endDate}
              onChange={handleOrderDateRangeChange}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="purchase-orders-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="purchase-orders-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo mã PO..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
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
            onPress={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>

          <LinkButton to="/manage/purchase-orders/create" className="text-xs">
            <Plus className="size-4" />
            Tạo PO thủ công
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
