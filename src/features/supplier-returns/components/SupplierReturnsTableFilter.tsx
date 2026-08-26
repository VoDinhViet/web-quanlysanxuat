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
import { Label } from "@/components/ui/label"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import type { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import { inventoryDocumentStatusLabels } from "@/lib/types/supplier-return.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryDocumentStatusLabels),
]

export function SupplierReturnsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/supplier-returns/" })
  const navigate = useNavigate({ from: "/manage/supplier-returns/" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  // Fields tucked behind the "Bộ lọc" popover — count so the trigger can hint they're active
  // even while the popover is closed.
  const activeFilterCount = [
    search.supplierId,
    search.status,
    search.poCode,
    search.iqcCode,
  ].filter(Boolean).length

  const [materialKeyword, setMaterialKeyword] = useState(
    search.materialKeyword ?? ""
  )
  const [poCode, setPoCode] = useState(search.poCode ?? "")
  const [iqcCode, setIqcCode] = useState(search.iqcCode ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // IqcTableFilter.tsx. `replace: true` keeps rapid keystrokes from flooding history; discrete
  // Select changes below push instead so Back undoes them one at a time.
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

  const handlePoCodeChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        poCode: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleIqcCodeChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        iqcCode: trimmed.length > 0 ? trimmed : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as InventoryDocumentStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    // Cancel every debounce first — a call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleMaterialKeywordChange.cancel()
    handlePoCodeChange.cancel()
    handleIqcCodeChange.cancel()
    setMaterialKeyword("")
    setPoCode("")
    setIqcCode("")
    void navigate({
      search: (prev) => {
        const {
          materialKeyword: _materialKeyword,
          poCode: _poCode,
          iqcCode: _iqcCode,
          supplierId: _supplierId,
          status: _status,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:flex-row lg:items-center lg:px-5">
      {/* Tìm kiếm vật tư — ô search chính, luôn hiện; các field còn lại nằm trong popover "Bộ lọc" */}
      <div className="relative flex-1 lg:max-w-sm">
        <Input
          id="supplier-returns-material-keyword"
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
              {/* Nhà cung cấp */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="supplier-returns-supplier"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Nhà cung cấp
                </Label>
                <Select
                  value={search.supplierId ?? "all"}
                  onValueChange={handleSupplierChange}
                >
                  <SelectTrigger
                    id="supplier-returns-supplier"
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

              {/* Trạng thái */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="supplier-returns-status"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Trạng thái
                </Label>
                <Select
                  value={search.status ?? "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger
                    id="supplier-returns-status"
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

              {/* PO */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="supplier-returns-po-code"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  PO
                </Label>
                <Input
                  id="supplier-returns-po-code"
                  className="text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập mã PO"
                  value={poCode}
                  onChange={(event) => {
                    setPoCode(event.target.value)
                    handlePoCodeChange(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      handlePoCodeChange.flush()
                    }
                  }}
                />
              </div>

              {/* Mã IQC */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="supplier-returns-iqc-code"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Mã IQC
                </Label>
                <Input
                  id="supplier-returns-iqc-code"
                  className="text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập mã IQC"
                  value={iqcCode}
                  onChange={(event) => {
                    setIqcCode(event.target.value)
                    handleIqcCodeChange(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      handleIqcCodeChange.flush()
                    }
                  }}
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
          label="Thêm phiếu trả"
          hint="Tính năng tạo phiếu trả NCC sắp có"
          variant="default"
        >
          <Plus className="size-4" />
          Thêm phiếu trả
        </PendingAction>
      </div>
    </div>
  )
}
