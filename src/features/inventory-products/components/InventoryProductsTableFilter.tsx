import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, HelpCircle, RotateCw, Search } from "lucide-react"

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
import type {
  InventoryProductCategory,
  InventoryProductStatus,
} from "@/lib/types/inventory-product.type"
import {
  inventoryProductCategoryLabels,
  inventoryProductStatusLabels,
} from "@/lib/types/inventory-product.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const clientOptions = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "ABC Electronics", label: "ABC Electronics" },
  { value: "DEF Tech", label: "DEF Tech" },
  { value: "GHI Industry", label: "GHI Industry" },
  { value: "JKL Co., Ltd", label: "JKL Co., Ltd" },
  { value: "MNO Solutions", label: "MNO Solutions" },
]

const categoryOptions = [
  { value: "all", label: "Tất cả nhóm" },
  ...buildOptionsFromLabels(inventoryProductCategoryLabels),
]

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(inventoryProductStatusLabels),
]

const dateModeOptions = [
  { value: "CURRENT", label: "Tồn hiện tại" },
  { value: "HISTORICAL", label: "Tồn lịch sử" },
]

export function InventoryProductsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-products" })
  const navigate = useNavigate({ from: "/manage/inventory-products" })

  const [q, setQ] = useState(search.q ?? "")
  const [poCode, setPoCode] = useState(search.poCode ?? "")

  const handleSearchDebounced = useDebounceCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: q.trim().length > 0 ? q.trim() : undefined,
        poCode: poCode.trim().length > 0 ? poCode.trim() : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleClientChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        clientName: value === "all" ? undefined : value,
        page: 1,
      }),
    })
  }

  const handleCategoryChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        category: value === "all" ? undefined : (value as InventoryProductCategory),
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        status: value === "all" ? undefined : (value as InventoryProductStatus),
        page: 1,
      }),
    })
  }

  const handleDateModeChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        dateMode: value,
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
    setPoCode("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          clientName: _clientName,
          poCode: _poCode,
          dateMode: _dateMode,
          category: _category,
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
        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 pb-3">
          <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs">
            <HelpCircle className="size-3.5 text-muted-foreground" />
            <span>Hướng dẫn</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            title="Tải lại dữ liệu"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5 text-muted-foreground" />
          </Button>

          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
            <Download className="size-4" />
            Xuất Excel
          </PendingAction>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Mã/Tên, Khách hàng, PO, Xem theo ngày */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <FilterLabel label="Mã / Tên thành phẩm" htmlFor="tp-q" />
              <div className="relative">
                <Input
                  id="tp-q"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập mã hoặc tên thành phẩm"
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
              <FilterLabel label="Khách hàng" htmlFor="tp-client" />
              <Select
                value={search.clientName ?? "all"}
                onValueChange={handleClientChange}
              >
                <SelectTrigger id="tp-client" className="w-full text-xs">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="PO" htmlFor="tp-pocode" />
              <div className="relative">
                <Input
                  id="tp-pocode"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập số PO"
                  value={poCode}
                  onChange={(e) => {
                    setPoCode(e.target.value)
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
              <FilterLabel label="Xem theo ngày" htmlFor="tp-datemode" />
              <Select
                value={search.dateMode ?? "CURRENT"}
                onValueChange={handleDateModeChange}
              >
                <SelectTrigger id="tp-datemode" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateModeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Nhóm sản phẩm, Trạng thái */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <FilterLabel label="Nhóm sản phẩm" htmlFor="tp-category" />
              <Select
                value={search.category ?? "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="tp-category" className="w-full text-xs">
                  <SelectValue placeholder="Chọn nhóm sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="tp-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="tp-status" className="w-full text-xs">
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
          </div>

          {/* Row 3: Ngày & Action buttons */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between pt-1">
            <div className="space-y-1.5 w-full sm:w-auto xl:w-96">
              <FilterLabel label="Ngày" htmlFor="tp-daterange" />
              <DateRangePicker
                id="tp-daterange"
                from={search.fromDate}
                to={search.toDate}
                onChange={handleDateRangeChange}
              />
            </div>

            <div className="flex items-center justify-end gap-2 self-end w-full lg:w-auto">
              <Button
                type="button"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={resetFilters}
              >
                <RotateCw className="size-3.5" />
                Xóa bộ lọc
              </Button>
              <Button
                type="button"
                className="text-xs gap-1.5"
                onClick={handleExecuteSearch}
              >
                <Search className="size-3.5" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
