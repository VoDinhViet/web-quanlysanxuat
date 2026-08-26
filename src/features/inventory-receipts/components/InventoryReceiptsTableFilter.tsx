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
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import type {
  InventoryReceiptStatus,
  InventoryReceiptType,
} from "@/lib/types/inventory-receipt.type"
import {
  inventoryReceiptStatusLabels,
  inventoryReceiptTypeLabels,
} from "@/lib/types/inventory-receipt.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const receiptTypeOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryReceiptTypeLabels),
]

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryReceiptStatusLabels),
]

export function InventoryReceiptsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-receipts/" })
  const navigate = useNavigate({ from: "/manage/inventory-receipts/" })
  const [q, setQ] = useState(search.q ?? "")

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

  const handleReceiptTypeChange = (value: string) => {
    const receiptType =
      value === "all" ? undefined : (value as InventoryReceiptType)
    void navigate({ search: (prev) => ({ ...prev, receiptType, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as InventoryReceiptStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
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
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          receiptType: _receiptType,
          status: _status,
          startDate: _startDate,
          endDate: _endDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-5 bg-card px-4 py-4 lg:px-5">
      {/* Top creation section */}
      <div className="border-b border-border/60 pb-4">
        <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Tạo phiếu nhập kho
        </p>
        <RoutePermissionGate route="/manage/inventory-receipts/create-from-po">
          <Button variant="outline" className="text-xs" asChild>
            <Link to="/manage/inventory-receipts/create-from-po">
              <Plus className="size-3.5" />
              Nhập từ PO
            </Link>
          </Button>
        </RoutePermissionGate>
      </div>

      {/* Filters section — DANH SÁCH PHIẾU NHẬP KHO */}
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(12rem,1.2fr)]">
          {/* Search input */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="nk-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="nk-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Mã phiếu, PO, khách hàng, NCC..."
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

          {/* Select Loại phiếu */}
          <div className="space-y-1.5">
            <Label
              htmlFor="nk-receipt-type"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Loại phiếu
            </Label>
            <Select
              value={search.receiptType ?? "all"}
              onValueChange={handleReceiptTypeChange}
            >
              <SelectTrigger id="nk-receipt-type" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {receiptTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Trạng thái */}
          <div className="space-y-1.5">
            <Label
              htmlFor="nk-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="nk-status" className="w-full text-xs">
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

          {/* DateRangePicker Từ ngày - Đến ngày */}
          <div className="space-y-1.5">
            <Label
              htmlFor="nk-date-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Từ ngày – Đến ngày
            </Label>
            <DateRangePicker
              id="nk-date-range"
              from={search.startDate}
              to={search.endDate}
              onChange={handleDateRangeChange}
            />
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
