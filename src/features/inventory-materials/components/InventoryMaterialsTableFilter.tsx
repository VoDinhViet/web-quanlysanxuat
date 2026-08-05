import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { InventoryStatus } from "@/lib/types/inventory-material.type"
import {
  INVENTORY_STATUS_LABELS,
} from "@/lib/types/inventory-material.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { InventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"

const ALL_VALUE = "all"

const STATUS_OPTIONS = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(INVENTORY_STATUS_LABELS),
]

type InventoryMaterialsTableFilterProps = {
  search: InventoryMaterialsSearchSchema
  onFilterChange: (
    patch: Partial<InventoryMaterialsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  materialGroupOptions: { id: string; name: string }[]
}

export function InventoryMaterialsTableFilter({
  search,
  onFilterChange,
  materialGroupOptions,
}: InventoryMaterialsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — the same delay used
  // in MaterialsTableFilter and PurchaseRequestsTableFilter. An empty term becomes
  // `undefined` so the schema's `.optional()` drops `q` from the URL entirely.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onFilterChange(
      { q: trimmed.length > 0 ? trimmed : undefined },
      { replace: true }
    )
  }, 300)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term
    // ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    onFilterChange({
      q: undefined,
      materialGroupId: undefined,
      status: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)]">
          {/* Tìm kiếm */}
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm kiếm vật tư tồn kho</span>
            <div className="relative">
              <Input
                id="inventory-materials-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo mã, tên vật tư..."
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
          </label>

          {/* Nhóm vật tư */}
          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Nhóm vật tư
            </span>
            <Select
              value={search.materialGroupId ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  materialGroupId: next === ALL_VALUE ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                {materialGroupOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {/* Trạng thái */}
          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? ALL_VALUE}
              onValueChange={(next) =>
                onFilterChange({
                  status:
                    next === ALL_VALUE ? undefined : (next as InventoryStatus),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {/* Actions */}
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Chú giải trạng thái */}
      <StatusLegend />
    </div>
  )
}

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">Trạng thái:</span>
      <LegendItem color="bg-success" label="Bình thường: Tồn khả dụng ≥ Min" />
      <LegendItem
        color="bg-warning"
        label="Cảnh báo: 0 ≤ Tồn khả dụng < Min"
      />
      <LegendItem color="bg-destructive" label="Thiếu: Tồn khả dụng < 0" />
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}
