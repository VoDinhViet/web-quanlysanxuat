import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { FileOutput, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FilterSelect } from "@/components/shared/primitives/FilterSelect"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableFilterBar } from "@/components/shared/sections/TableFilterBar"
import { useFilterSearchTerm } from "@/hooks/use-filter-search-term"
import { inventoryRequisitionStatusLabels } from "@/lib/types/inventory-requisition.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryRequisitionStatusLabels),
]

export function InventoryRequisitionsTableFilter() {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-requisitions/",
  })
  const navigate = useNavigate({ from: "/manage/inventory-requisitions/" })

  const searchTerm = useFilterSearchTerm({
    initialValue: search.q ?? "",
    onSearch: (term) => {
      const trimmed = term.trim()
      void navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed.length > 0 ? trimmed : undefined,
          page: 1,
        }),
        replace: true,
      })
    },
  })

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as InventoryRequisitionStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    searchTerm.reset()
    void navigate({
      search: (prev) => {
        const { q: _q, status: _status, ...rest } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TableFilterBar
      createLabel="Tạo phiếu lãnh"
      createAction={
        <RoutePermissionGate route="/manage/inventory-requisitions/create">
          <Button className="text-xs" asChild>
            <Link to="/manage/inventory-requisitions/create">
              <FileOutput className="size-3.5" />
              Tạo phiếu lãnh
            </Link>
          </Button>
        </RoutePermissionGate>
      }
      fields={
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(12rem,1.2fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-code"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Mã phiếu lãnh
            </Label>
            <div className="relative">
              <Input
                id="lv-code"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Nhập mã phiếu lãnh..."
                value={searchTerm.value}
                onChange={(event) => searchTerm.onChange(event.target.value)}
                onKeyDown={searchTerm.onEnterKeyDown}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <FilterSelect
            id="lv-status"
            label="Trạng thái"
            value={search.status ?? "all"}
            options={statusOptions}
            onValueChange={handleStatusChange}
          />
        </div>
      }
      onReset={resetFilters}
    />
  )
}
