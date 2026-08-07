import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { RotateCw, Search, X } from "lucide-react"

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
import { DatePicker } from "@/components/shared/DatePicker"
import { FilterLabel } from "@/components/shared/FilterLabel"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"
import type { InventoryStatus } from "@/lib/types/inventory-material.type"
import { inventoryStatusLabels } from "@/lib/types/inventory-material.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryStatusLabels),
]

export function InventoryMaterialsTableFilter() {
  // useSearch keys off the file-based route id; useNavigate's `from` keys off the
  // resolved URL path — same split InventoryMaterialsPage uses for its own copy.
  const search = useSearch({ from: "/(authed)/manage_/inventory-materials" })
  const navigate = useNavigate({ from: "/manage/inventory-materials" })

  // The route loader already prefetches both — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )
  const { data: warehouseOptions } = useSuspenseQuery(
    warehouseOptionsQueryOptions()
  )
  const [q, setQ] = useState(search.q ?? "")

  // Debounced keystrokes push many entries into history very fast; `replace`
  // keeps Back usable. Discrete filter changes below use push (the default)
  // so Back undoes them one by one.
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

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const handleWarehouseChange = (value: string) => {
    const warehouseId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, warehouseId, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as InventoryStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

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
        const {
          q: _q,
          supplierId: _supplierId,
          warehouseId: _warehouseId,
          status: _status,
          asOfDate: _asOfDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1.5fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(9rem,1fr)]">
            {/* Tìm kiếm */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel
                label="Tìm kiếm"
                htmlFor="inventory-materials-search"
              />
              <div className="relative">
                <Input
                  id="inventory-materials-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Mã vật tư, tên vật tư..."
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
                {q ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    onClick={() => {
                      setQ("")
                      handleSearch.cancel()
                      void navigate({
                        search: (prev) => ({
                          ...prev,
                          q: undefined,
                          page: 1,
                        }),
                        replace: true,
                      })
                    }}
                  >
                    <X className="size-3.5" />
                  </Button>
                ) : (
                  <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Nhà cung cấp */}
            <div className="space-y-1.5">
              <FilterLabel label="Nhà cung cấp" htmlFor="inventory-supplier" />
              <Select
                value={search.supplierId ?? "all"}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger
                  id="inventory-supplier"
                  className="w-full text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {supplierOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kho */}
            <div className="space-y-1.5">
              <FilterLabel label="Kho" htmlFor="inventory-warehouse" />
              <Select
                value={search.warehouseId ?? "all"}
                onValueChange={handleWarehouseChange}
              >
                <SelectTrigger
                  id="inventory-warehouse"
                  className="w-full text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {warehouseOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <FilterLabel
                htmlFor="inventory-status"
                label="Trạng thái"
                tooltip={
                  <>
                    <p>Bình thường: Tồn khả dụng ≥ Min</p>
                    <p>Cảnh báo: 0 ≤ Tồn khả dụng &lt; Min</p>
                    <p>Thiếu: Tồn khả dụng &lt; 0</p>
                  </>
                }
              />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="inventory-status" className="w-full text-xs">
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

            {/* Xem tồn tại ngày */}
            <div className="space-y-1.5">
              <FilterLabel
                label="Xem tồn tại ngày"
                htmlFor="inventory-materials-as-of-date"
                tooltip="Tồn kho tại thời điểm 23:59 ngày đã chọn — để trống là xem tồn hiện tại"
              />
              <DatePicker
                id="inventory-materials-as-of-date"
                value={search.asOfDate ?? ""}
                onChange={handleAsOfDateChange}
              />
            </div>
          </div>

          <Button
            id="inventory-reset-filters"
            type="button"
            variant="outline"
            className="shrink-0 gap-1.5 text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
