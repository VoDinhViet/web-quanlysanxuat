import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
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
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import type { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import { paymentRequestStatusLabels } from "@/lib/types/payment-request.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(paymentRequestStatusLabels),
]

export function PaymentRequestsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/payment-requests" })
  const navigate = useNavigate({ from: "/manage/payment-requests" })
  const [q, setQ] = useState(search.q ?? "")
  const [poCode, setPoCode] = useState(search.poCode ?? "")

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: suppliers } = useSuspenseQuery(supplierOptionsQueryOptions())
  const supplierFilterOptions = [
    { value: "all", label: "Tất cả" },
    ...buildSelectOptions(suppliers),
  ]

  // Debounced search — 300ms after last keystroke, same idiom as OrdersTableFilter. Factored so
  // the q/poCode boxes (identical debounce/navigate shape, only the search key differs) share it.
  const useDebouncedSearchNav = (key: "q" | "poCode") =>
    useDebounceCallback((term: string) => {
      const trimmed = term.trim()
      void navigate({
        search: (prev) => ({
          ...prev,
          [key]: trimmed.length > 0 ? trimmed : undefined,
          page: 1,
        }),
        replace: true,
      })
    }, 300)

  const handleSearch = useDebouncedSearchNav("q")
  const handlePoCodeSearch = useDebouncedSearchNav("poCode")

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as PaymentRequestStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
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
    handleSearch.cancel()
    handlePoCodeSearch.cancel()
    setQ("")
    setPoCode("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          supplierId: _supplierId,
          poCode: _poCode,
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
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(12rem,1.2fr)_minmax(11rem,1fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_minmax(12rem,1.2fr)]">
          {/* Từ ngày / Đến ngày */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="pr-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Từ ngày – Đến ngày
            </Label>
            <DateRangePicker
              id="pr-date-range"
              from={search.startDate}
              to={search.endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Nhà cung cấp */}
          <div className="space-y-1.5">
            <Label
              htmlFor="pr-supplier"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Nhà cung cấp
            </Label>
            <Select
              value={search.supplierId ?? "all"}
              onValueChange={handleSupplierChange}
            >
              <SelectTrigger id="pr-supplier" className="w-full text-xs">
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

          {/* Mã PO */}
          <div className="space-y-1.5">
            <Label
              htmlFor="pr-po-code"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Mã PO
            </Label>
            <Input
              id="pr-po-code"
              className="text-xs placeholder:text-muted-foreground/75"
              placeholder="PO2405-012..."
              value={poCode}
              onChange={(event) => {
                setPoCode(event.target.value)
                handlePoCodeSearch(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handlePoCodeSearch.flush()
                }
              }}
            />
          </div>

          {/* Trạng thái */}
          <div className="space-y-1.5">
            <Label
              htmlFor="pr-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
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

          {/* Tìm kiếm mã YCTT / Mã PO */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="pr-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
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
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
