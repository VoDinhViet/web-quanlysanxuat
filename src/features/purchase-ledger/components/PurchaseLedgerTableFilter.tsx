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
import { MockDataBadge } from "@/components/shared/MockDataBadge"
import { PendingAction } from "@/components/shared/PendingAction"
import { purchaseLedgerStatusLabels } from "@/lib/types/purchase-ledger.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(purchaseLedgerStatusLabels),
]

export function PurchaseLedgerTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/purchase-ledger" })
  const navigate = useNavigate({ from: "/manage/purchase-ledger" })
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // PurchaseRequestsTableFilter.tsx. Enter calls `.flush()` to apply immediately without waiting
  // out the debounce.
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
    const status = value === "all" ? undefined : (value as PurchaseLedgerStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleCreatedDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        createdDateFrom: range.from,
        createdDateTo: range.to,
        page: 1,
      }),
    })
  }

  const handleNeededDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        neededDateFrom: range.from,
        neededDateTo: range.to,
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
          createdDateFrom: _createdDateFrom,
          createdDateTo: _createdDateTo,
          neededDateFrom: _neededDateFrom,
          neededDateTo: _neededDateTo,
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
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(14rem,1.3fr)_minmax(14rem,1.3fr)_minmax(14rem,1.4fr)]">
            <div className="space-y-1.5">
              <FilterLabel
                label="Trạng thái"
                htmlFor="purchase-ledger-status"
              />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger
                  id="purchase-ledger-status"
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
              <FilterLabel
                label="Ngày tạo PR"
                htmlFor="purchase-ledger-created-range"
              />
              <DateRangePicker
                id="purchase-ledger-created-range"
                from={search.createdDateFrom}
                to={search.createdDateTo}
                onChange={handleCreatedDateRangeChange}
              />
            </div>

            <div className="space-y-1.5">
              <FilterLabel
                label="Ngày cần"
                htmlFor="purchase-ledger-needed-range"
              />
              <DateRangePicker
                id="purchase-ledger-needed-range"
                from={search.neededDateFrom}
                to={search.neededDateTo}
                onChange={handleNeededDateRangeChange}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="purchase-ledger-search" />
              <div className="relative">
                <Input
                  id="purchase-ledger-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm theo Mã PR, mã/tên vật tư, mã PO..."
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
            <MockDataBadge />

            <Button
              type="button"
              variant="outline"
              className="text-xs"
              onClick={resetFilters}
            >
              <RotateCw className="size-4" />
              Làm mới
            </Button>

            <PendingAction
              label="Xuất Excel"
              hint="Tính năng xuất Excel sắp có"
            >
              <Download className="size-4" />
              Xuất Excel
            </PendingAction>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
