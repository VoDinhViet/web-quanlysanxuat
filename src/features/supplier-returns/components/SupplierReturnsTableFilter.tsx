import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

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
import { FilterLabel } from "@/components/shared/FilterLabel"
import { PendingAction } from "@/components/shared/PendingAction"
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
  const search = useSearch({ from: "/(authed)/manage_/supplier-returns" })
  const navigate = useNavigate({ from: "/manage/supplier-returns" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  const [materialKeyword, setMaterialKeyword] = useState(
    search.materialKeyword ?? ""
  )
  const [poCode, setPoCode] = useState(search.poCode ?? "")
  const [iqcCode, setIqcCode] = useState(search.iqcCode ?? "")
  const [nkCode, setNkCode] = useState(search.nkCode ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // InventoryMaterialsTableFilter.tsx. `replace: true` keeps rapid keystrokes from flooding
  // history; discrete Select changes below push instead so Back undoes them one at a time.
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

  const handleNkCodeChange = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        nkCode: trimmed.length > 0 ? trimmed : undefined,
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
    handleNkCodeChange.cancel()
    setMaterialKeyword("")
    setPoCode("")
    setIqcCode("")
    setNkCode("")
    void navigate({
      search: (prev) => {
        const {
          materialKeyword: _materialKeyword,
          poCode: _poCode,
          iqcCode: _iqcCode,
          nkCode: _nkCode,
          supplierId: _supplierId,
          status: _status,
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
            {/* Tìm kiếm vật tư */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel
                label="Tìm kiếm vật tư"
                htmlFor="supplier-returns-material-keyword"
              />
              <div className="relative">
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
            </div>

            {/* Nhà cung cấp */}
            <div className="space-y-1.5">
              <FilterLabel
                label="Nhà cung cấp"
                htmlFor="supplier-returns-supplier"
              />
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

            {/* PO */}
            <div className="space-y-1.5">
              <FilterLabel label="PO" htmlFor="supplier-returns-po-code" />
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
              <FilterLabel label="Mã IQC" htmlFor="supplier-returns-iqc-code" />
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

            {/* Mã NK */}
            <div className="space-y-1.5">
              <FilterLabel label="Mã NK" htmlFor="supplier-returns-nk-code" />
              <Input
                id="supplier-returns-nk-code"
                className="text-xs placeholder:text-muted-foreground/75"
                placeholder="Nhập mã nhập kho"
                value={nkCode}
                onChange={(event) => {
                  setNkCode(event.target.value)
                  handleNkCodeChange(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleNkCodeChange.flush()
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* Trạng thái */}
          <div className="w-full space-y-1.5 sm:max-w-52">
            <FilterLabel label="Trạng thái" htmlFor="supplier-returns-status" />
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

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto">
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
      </div>
    </TooltipProvider>
  )
}
