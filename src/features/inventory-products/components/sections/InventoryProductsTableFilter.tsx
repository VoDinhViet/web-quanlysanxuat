import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/shared/composites/DatePicker"
import { FilterLabel } from "@/components/shared/primitives/FilterLabel"
import { PendingAction } from "@/components/shared/primitives/PendingAction"

export function InventoryProductsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/inventory-products/" })
  const navigate = useNavigate({ from: "/manage/inventory-products/" })

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

  const handleAsOfDateChange = (value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, asOfDate: value || undefined, page: 1 }),
    })
  }

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const { q: _q, asOfDate: _asOfDate, ...rest } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      {/* Ô lọc và các nút hành động chung 1 hàng */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-1.5">
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
                handleSearch(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSearch.flush()
                }
              }}
            />
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="w-48 space-y-1.5">
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

        <Button
          type="button"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={resetFilters}
        >
          <RotateCw className="size-3.5" />
          Xóa bộ lọc
        </Button>

        <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
          <Download className="size-4" />
          Xuất Excel
        </PendingAction>
      </div>
    </div>
  )
}
