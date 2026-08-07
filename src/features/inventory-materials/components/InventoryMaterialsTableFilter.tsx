import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import {
  RotateCw,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DateRangeFilter } from "@/components/shared/DateRangeFilter"
import type { InventoryStatus } from "@/lib/types/inventory-material.type"
import { INVENTORY_STATUS_LABELS } from "@/lib/types/inventory-material.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"
import type { InventoryMaterialsSearchSchema } from "@/features/inventory-materials/schemas/inventory-materials-search.schema"

const ALL_VALUE = "all"

const STATUS_OPTIONS: SelectOption[] = [
  { value: ALL_VALUE, label: "Tất cả" },
  ...buildOptionsFromLabels(INVENTORY_STATUS_LABELS),
]

type OptionItem = { id: string; name: string }

type InventoryMaterialsTableFilterProps = {
  search: InventoryMaterialsSearchSchema
  onFilterChange: (
    patch: Partial<InventoryMaterialsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  materialGroupOptions: OptionItem[]
  materialTypeOptions?: OptionItem[]
  supplierOptions?: OptionItem[]
  warehouseOptions?: OptionItem[]
}

export function InventoryMaterialsTableFilter({
  search,
  onFilterChange,
  materialGroupOptions,
  materialTypeOptions = [],
  supplierOptions = [],
  warehouseOptions = [],
}: InventoryMaterialsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")
  const [advancedOpen, setAdvancedOpen] = useState(
    // Auto-open if any advanced filter is already active from URL
    !!(
      search.materialTypeId ??
      search.warehouseId ??
      (search.dateMode === "range" ? search.dateMode : undefined)
    )
  )

  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onFilterChange(
      { q: trimmed.length > 0 ? trimmed : undefined },
      { replace: true }
    )
  }, 300)

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    onFilterChange({
      q: undefined,
      materialGroupId: undefined,
      materialTypeId: undefined,
      supplierId: undefined,
      warehouseId: undefined,
      status: undefined,
      dateMode: undefined,
      fromDate: undefined,
      toDate: undefined,
      order: undefined,
    })
  }

  // Count active advanced filters (loại, kho, date range) for badge
  const advancedActiveCount = [
    search.materialTypeId,
    search.warehouseId,
    search.dateMode === "range" ? search.dateMode : undefined,
  ].filter(Boolean).length

  const dateMode = search.dateMode ?? "current"

  return (
    <TooltipProvider>
      <Collapsible
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        className="flex flex-col bg-card"
      >
        {/* ── Tầng 1: Bộ lọc cơ bản ─────────────────────────────── */}
        <div className="flex flex-col gap-3 px-4 py-3.5 lg:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Filter grid */}
            <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,2fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(9rem,1fr)]">
              {/* Tìm kiếm */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label
                  htmlFor="inventory-materials-search"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Tìm kiếm
                </Label>
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
                        onFilterChange({ q: undefined }, { replace: true })
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  ) : (
                    <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Nhóm vật tư */}
              <FilterSelectField
                id="inventory-group"
                label="Nhóm vật tư"
                value={search.materialGroupId ?? ALL_VALUE}
                options={materialGroupOptions}
                onValueChange={(next) =>
                  onFilterChange({
                    materialGroupId: next === ALL_VALUE ? undefined : next,
                  })
                }
              />

              {/* Nhà cung cấp */}
              <FilterSelectField
                id="inventory-supplier"
                label="Nhà cung cấp"
                value={search.supplierId ?? ALL_VALUE}
                options={supplierOptions}
                onValueChange={(next) =>
                  onFilterChange({
                    supplierId: next === ALL_VALUE ? undefined : next,
                  })
                }
              />

              {/* Trạng thái */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="inventory-status"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Trạng thái
                </Label>
                <Select
                  value={search.status ?? ALL_VALUE}
                  onValueChange={(next) =>
                    onFilterChange({
                      status:
                        next === ALL_VALUE
                          ? undefined
                          : (next as InventoryStatus),
                    })
                  }
                >
                  <SelectTrigger
                    id="inventory-status"
                    className="w-full text-xs"
                  >
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-wrap items-end gap-2 lg:self-end">
              {/* Toggle Lọc nâng cao — CollapsibleTrigger wraps Button */}
              <CollapsibleTrigger asChild>
                <Button
                  id="inventory-advanced-filter-toggle"
                  type="button"
                  variant="outline"
                  className={cn(
                    "gap-1.5 text-xs",
                    advancedOpen &&
                      "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <SlidersHorizontal className="size-3.5" />
                  Lọc nâng cao
                  {advancedActiveCount > 0 && (
                    <Badge
                      variant="default"
                      className="h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
                    >
                      {advancedActiveCount}
                    </Badge>
                  )}
                  {advancedOpen ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <Button
                id="inventory-reset-filters"
                type="button"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={resetFilters}
              >
                <RotateCw className="size-3.5" />
                Xóa bộ lọc
              </Button>

              <Button
                id="inventory-search-btn"
                type="button"
                className="gap-1.5 text-xs"
                onClick={() => handleSearch.flush()}
              >
                <Search className="size-3.5" />
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Active filter chips */}
          <ActiveFilterChips
            search={search}
            materialGroupOptions={materialGroupOptions}
            materialTypeOptions={materialTypeOptions}
            supplierOptions={supplierOptions}
            warehouseOptions={warehouseOptions}
            onRemove={(patch) => onFilterChange(patch)}
          />
        </div>

        {/* ── Tầng 2: Lọc nâng cao (Collapsible animated) ─────────── */}
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <Separator />
          <div className="bg-muted/30 px-4 py-4 lg:px-5">
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Bộ lọc nâng cao
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_minmax(22rem,2fr)]">
              {/* Loại vật tư */}
              <FilterSelectField
                id="inventory-type"
                label="Loại vật tư"
                value={search.materialTypeId ?? ALL_VALUE}
                options={materialTypeOptions}
                onValueChange={(next) =>
                  onFilterChange({
                    materialTypeId: next === ALL_VALUE ? undefined : next,
                  })
                }
              />

              {/* Kho */}
              <FilterSelectField
                id="inventory-warehouse"
                label="Kho"
                value={search.warehouseId ?? ALL_VALUE}
                options={warehouseOptions}
                onValueChange={(next) =>
                  onFilterChange({
                    warehouseId: next === ALL_VALUE ? undefined : next,
                  })
                }
              />

              {/* Spacer */}
              <div className="hidden lg:block" />

              {/* Thời gian xem tồn kho */}
              <div className="space-y-2.5 rounded-lg border border-border/70 bg-card px-4 py-3 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">
                    Thời gian xem tồn
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Tồn kho tại thời điểm 23:59 của ngày &apos;Đến ngày&apos;
                    </TooltipContent>
                  </Tooltip>
                </div>

                <RadioGroup
                  id="inventory-datemode"
                  value={dateMode}
                  onValueChange={(val) => {
                    const mode = val as "current" | "range"
                    onFilterChange({
                      dateMode: mode === "current" ? undefined : mode,
                      fromDate:
                        mode === "current" ? undefined : search.fromDate,
                      toDate: mode === "current" ? undefined : search.toDate,
                    })
                  }}
                  className="flex flex-row gap-5"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="datemode-current" value="current" />
                    <Label
                      htmlFor="datemode-current"
                      className="cursor-pointer text-xs font-normal"
                    >
                      Hiện tại
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem id="datemode-range" value="range" />
                    <Label
                      htmlFor="datemode-range"
                      className="cursor-pointer text-xs font-normal"
                    >
                      Theo khoảng thời gian
                    </Label>
                  </div>
                </RadioGroup>

                {dateMode === "range" && (
                  <DateRangeFilter
                    idPrefix="inventory-materials"
                    fromLabel="Từ ngày"
                    toLabel="Đến ngày"
                    from={search.fromDate}
                    to={search.toDate}
                    onChange={(range) =>
                      onFilterChange({
                        fromDate: range.from,
                        toDate: range.to,
                      })
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </CollapsibleContent>

        {/* ── Tầng 3: Footer — chú giải & tổng kết ─────────────────── */}
        <Separator />
        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5">
          <StatusLegend />
          <SummaryInfo search={search} />
        </div>
      </Collapsible>
    </TooltipProvider>
  )
}

// ── Reusable select field ────────────────────────────────────────────────────

type FilterSelectFieldProps = {
  id: string
  label: string
  value: string
  options: OptionItem[]
  onValueChange: (value: string) => void
}

function FilterSelectField({
  id,
  label,
  value,
  options,
  onValueChange,
}: FilterSelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium text-muted-foreground"
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── Active filter chips ──────────────────────────────────────────────────────

type ActiveFilterChipsProps = {
  search: InventoryMaterialsSearchSchema
  materialGroupOptions: OptionItem[]
  materialTypeOptions: OptionItem[]
  supplierOptions: OptionItem[]
  warehouseOptions: OptionItem[]
  onRemove: (patch: Partial<InventoryMaterialsSearchSchema>) => void
}

function ActiveFilterChips({
  search,
  materialGroupOptions,
  materialTypeOptions,
  supplierOptions,
  warehouseOptions,
  onRemove,
}: ActiveFilterChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = []

  if (search.materialGroupId) {
    const name =
      materialGroupOptions.find((o) => o.id === search.materialGroupId)?.name ??
      search.materialGroupId
    chips.push({
      key: "group",
      label: `Nhóm: ${name}`,
      onRemove: () => onRemove({ materialGroupId: undefined }),
    })
  }
  if (search.materialTypeId) {
    const name =
      materialTypeOptions.find((o) => o.id === search.materialTypeId)?.name ??
      search.materialTypeId
    chips.push({
      key: "type",
      label: `Loại: ${name}`,
      onRemove: () => onRemove({ materialTypeId: undefined }),
    })
  }
  if (search.supplierId) {
    const name =
      supplierOptions.find((o) => o.id === search.supplierId)?.name ??
      search.supplierId
    chips.push({
      key: "supplier",
      label: `NCC: ${name}`,
      onRemove: () => onRemove({ supplierId: undefined }),
    })
  }
  if (search.warehouseId) {
    const name =
      warehouseOptions.find((o) => o.id === search.warehouseId)?.name ??
      search.warehouseId
    chips.push({
      key: "warehouse",
      label: `Kho: ${name}`,
      onRemove: () => onRemove({ warehouseId: undefined }),
    })
  }
  if (search.status) {
    chips.push({
      key: "status",
      label: `Trạng thái: ${INVENTORY_STATUS_LABELS[search.status]}`,
      onRemove: () => onRemove({ status: undefined }),
    })
  }
  if (search.dateMode === "range") {
    const from = search.fromDate ?? "?"
    const to = search.toDate ?? "?"
    chips.push({
      key: "daterange",
      label: `Tồn: ${from} → ${to}`,
      onRemove: () =>
        onRemove({
          dateMode: undefined,
          fromDate: undefined,
          toDate: undefined,
        }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">Đang lọc:</span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 rounded-full border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-primary"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full opacity-60 hover:text-destructive hover:opacity-100"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}

// ── Status Legend ────────────────────────────────────────────────────────────

function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
      <span className="font-medium text-foreground">Trạng thái:</span>
      <LegendItem color="bg-success" label="Bình thường: Tồn khả dụng ≥ Min" />
      <LegendItem color="bg-warning" label="Cảnh báo: 0 ≤ Tồn khả dụng < Min" />
      <LegendItem color="bg-destructive" label="Thiếu: Tồn khả dụng < 0" />
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", color)} />
      {label}
    </span>
  )
}

// ── Summary Info ─────────────────────────────────────────────────────────────

function SummaryInfo({ search }: { search: InventoryMaterialsSearchSchema }) {
  if (search.dateMode !== "range" || (!search.fromDate && !search.toDate)) {
    return (
      <span className="text-[11px] text-muted-foreground">
        Thời gian xem tồn:{" "}
        <span className="font-medium text-foreground">Hiện tại</span>
      </span>
    )
  }
  return (
    <span className="text-[11px] text-muted-foreground">
      Thời gian xem tồn: Từ{" "}
      <span className="font-medium text-foreground">
        {search.fromDate ?? "—"}
      </span>{" "}
      đến{" "}
      <span className="font-medium text-foreground">
        {search.toDate ?? "—"} (23:59)
      </span>
    </span>
  )
}
