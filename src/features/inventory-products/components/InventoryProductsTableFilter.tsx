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
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/inputs/DatePicker"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { PendingAction } from "@/components/shared/buttons/PendingAction"

const clientOptions = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "ABC Electronics", label: "ABC Electronics" },
  { value: "DEF Tech", label: "DEF Tech" },
  { value: "GHI Industry", label: "GHI Industry" },
  { value: "JKL Co., Ltd", label: "JKL Co., Ltd" },
  { value: "MNO Solutions", label: "MNO Solutions" },
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

  const handleAsOfDateChange = (value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, asOfDate: value || undefined, page: 1 }),
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
          asOfDate: _asOfDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      {/* Top Header Action Buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 pb-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
        >
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
        {/* Mã/Tên, Khách hàng, PO, Xem tồn tại ngày */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="tp-q"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Mã / Tên thành phẩm
            </Label>
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
            <Label
              htmlFor="tp-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
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
            <Label
              htmlFor="tp-pocode"
              className="text-[11px] font-medium text-muted-foreground"
            >
              PO
            </Label>
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
            <FilterLabel
              label="Xem tồn tại ngày"
              htmlFor="tp-as-of-date"
              tooltip="Tồn kho tại thời điểm 23:59 ngày đã chọn — để trống là xem tồn hiện tại"
            />
            <DatePicker
              id="tp-as-of-date"
              value={search.asOfDate ?? ""}
              onChange={handleAsOfDateChange}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-1">
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
            Tìm kiếm
          </Button>
        </div>
      </div>
    </div>
  )
}
