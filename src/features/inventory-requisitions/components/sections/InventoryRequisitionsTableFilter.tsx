import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { FileOutput } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FilterSelect } from "@/components/shared/primitives/FilterSelect"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { TableSearchInput } from "@/components/shared/primitives/TableSearchInput"
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
          <TableSearchInput
            id="lv-code"
            label="Mã phiếu lãnh"
            placeholder="Nhập mã phiếu lãnh..."
            value={searchTerm.value}
            onChange={searchTerm.onChange}
            onKeyDown={searchTerm.onEnterKeyDown}
          />

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
