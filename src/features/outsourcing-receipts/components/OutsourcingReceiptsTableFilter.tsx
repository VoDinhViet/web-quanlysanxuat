import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { ListFilter, Plus, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { warehouseOptionsQueryOptions } from "@/features/warehouses/api"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { outsourcingReceiptStatusLabels } from "@/lib/types/outsourcing-receipt.type"
import type { InventoryDocumentStatus } from "@/lib/types/outsourcing-receipt.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(outsourcingReceiptStatusLabels),
]

const requiresIqcOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "true", label: "Có yêu cầu QC" },
  { value: "false", label: "Không yêu cầu QC" },
]

export function OutsourcingReceiptsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-receipts" })
  const navigate = useNavigate({ from: "/manage/outsourcing-receipts" })

  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )
  const { data: warehouseOptions } = useSuspenseQuery(
    warehouseOptionsQueryOptions()
  )

  const activeFilterCount = [
    search.supplierId,
    search.warehouseId,
    search.status,
    search.requiresIqc,
    search.fromDate,
    search.toDate,
  ].filter((value) => value !== undefined).length

  const [materialKeyword, setMaterialKeyword] = useState(
    search.materialKeyword ?? ""
  )

  const handleMaterialKeywordChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        materialKeyword: trimmed.length > 0 ? trimmed : undefined,
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
    const status =
      value === "all" ? undefined : (value as InventoryDocumentStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleRequiresIqcChange = (value: string) => {
    const requiresIqc = value === "all" ? undefined : value === "true"
    void navigate({ search: (prev) => ({ ...prev, requiresIqc, page: 1 }) })
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

  const resetFilters = () => {
    handleMaterialKeywordChange.cancel()
    setMaterialKeyword("")
    void navigate({
      search: (prev) => {
        const {
          materialKeyword: _materialKeyword,
          supplierId: _supplierId,
          warehouseId: _warehouseId,
          status: _status,
          requiresIqc: _requiresIqc,
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
      <div className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:flex-row lg:items-center lg:px-5">
        <div className="relative flex-1 lg:max-w-sm">
          <Input
            id="outsourcing-receipts-material-keyword"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Nhập mã vật tư, tên vật tư..."
            value={materialKeyword}
            onChange={(event) => {
              setMaterialKeyword(event.target.value)
              handleMaterialKeywordChange(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                handleMaterialKeywordChange.flush()
              }
            }}
          />
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" className="text-xs">
                <ListFilter className="size-3.5" />
                Bộ lọc
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 gap-3 sm:w-96">
              <p className="text-xs font-semibold text-foreground">Bộ lọc</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <FilterLabel
                    label="Nhà cung cấp"
                    htmlFor="outsourcing-receipts-supplier"
                  />
                  <Select
                    value={search.supplierId ?? "all"}
                    onValueChange={handleSupplierChange}
                  >
                    <SelectTrigger
                      id="outsourcing-receipts-supplier"
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

                <div className="space-y-1.5">
                  <FilterLabel
                    label="Kho nhận"
                    htmlFor="outsourcing-receipts-warehouse"
                  />
                  <Select
                    value={search.warehouseId ?? "all"}
                    onValueChange={handleWarehouseChange}
                  >
                    <SelectTrigger
                      id="outsourcing-receipts-warehouse"
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

                <div className="space-y-1.5">
                  <FilterLabel
                    label="Trạng thái"
                    htmlFor="outsourcing-receipts-status"
                  />
                  <Select
                    value={search.status ?? "all"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger
                      id="outsourcing-receipts-status"
                      className="w-full text-xs"
                    >
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

                <div className="space-y-1.5">
                  <FilterLabel
                    label="Yêu cầu QC"
                    htmlFor="outsourcing-receipts-requires-iqc"
                  />
                  <Select
                    value={
                      search.requiresIqc === undefined
                        ? "all"
                        : String(search.requiresIqc)
                    }
                    onValueChange={handleRequiresIqcChange}
                  >
                    <SelectTrigger
                      id="outsourcing-receipts-requires-iqc"
                      className="w-full text-xs"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requiresIqcOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <FilterLabel
                    label="Từ ngày – Đến ngày"
                    htmlFor="outsourcing-receipts-daterange"
                  />
                  <DateRangePicker
                    id="outsourcing-receipts-daterange"
                    from={search.fromDate}
                    to={search.toDate}
                    onChange={handleDateRangeChange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5" />
            Xóa bộ lọc
          </Button>

          <PendingAction
            label="Lập phiếu OS-IN"
            hint="Tính năng lập phiếu OS-IN sắp có"
            variant="default"
          >
            <Plus className="size-4" />
            Lập phiếu OS-IN
          </PendingAction>
        </div>
      </div>
    </TooltipProvider>
  )
}
