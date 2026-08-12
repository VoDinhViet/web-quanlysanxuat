import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { ChevronDown, Download, Plus, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import type { IqcDisposition, IqcResult, IqcStatus } from "@/lib/types/iqc.type"
import {
  iqcDispositionLabels,
  iqcResultLabels,
  iqcStatusLabels,
} from "@/lib/types/iqc.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const resultOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(iqcResultLabels),
]

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(iqcStatusLabels),
]

const dispositionOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(iqcDispositionLabels),
]

export function IqcTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/iqc" })
  const navigate = useNavigate({ from: "/manage/iqc" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  // Filters tucked behind "Mở rộng" — count so the trigger can hint they're active while
  // collapsed, and so a URL that already carries one (e.g. F5 on ?supplierId=...) opens expanded.
  const advancedFilterCount = [
    search.disposition,
    search.supplierId,
    search.nkCode,
    search.poCode,
  ].filter(Boolean).length

  const [isExpanded, setIsExpanded] = useState(advancedFilterCount > 0)

  const [materialKeyword, setMaterialKeyword] = useState(
    search.materialKeyword ?? ""
  )
  const [code, setCode] = useState(search.q ?? "")
  const [nkCode, setNkCode] = useState(search.nkCode ?? "")
  const [poCode, setPoCode] = useState(search.poCode ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // SupplierReturnsTableFilter.tsx. `replace: true` keeps rapid keystrokes from flooding history;
  // discrete Select changes below push instead so Back undoes them one at a time.
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

  const handleCodeChange = useDebounceCallback((term: string) => {
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

  const handleResultChange = (value: string) => {
    const result = value === "all" ? undefined : (value as IqcResult)
    void navigate({ search: (prev) => ({ ...prev, result, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as IqcStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleDispositionChange = (value: string) => {
    const disposition = value === "all" ? undefined : (value as IqcDisposition)
    void navigate({ search: (prev) => ({ ...prev, disposition, page: 1 }) })
  }

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const resetFilters = () => {
    // Cancel every debounce first — a call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleMaterialKeywordChange.cancel()
    handleCodeChange.cancel()
    handleNkCodeChange.cancel()
    handlePoCodeChange.cancel()
    setMaterialKeyword("")
    setCode("")
    setNkCode("")
    setPoCode("")
    void navigate({
      search: (prev) => {
        const {
          materialKeyword: _materialKeyword,
          q: _q,
          nkCode: _nkCode,
          poCode: _poCode,
          supplierId: _supplierId,
          result: _result,
          status: _status,
          disposition: _disposition,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:px-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
            {/* Tìm kiếm vật tư */}
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel
                label="Tìm kiếm vật tư"
                htmlFor="iqc-material-keyword"
              />
              <div className="relative">
                <Input
                  id="iqc-material-keyword"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập mã hoặc tên vật tư..."
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

            {/* Mã IQC */}
            <div className="space-y-1.5">
              <FilterLabel label="Mã IQC" htmlFor="iqc-code" />
              <Input
                id="iqc-code"
                className="text-xs placeholder:text-muted-foreground/75"
                placeholder="Nhập mã IQC"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  handleCodeChange(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    handleCodeChange.flush()
                  }
                }}
              />
            </div>

            {/* Kết quả QC */}
            <div className="space-y-1.5">
              <FilterLabel label="Kết quả QC" htmlFor="iqc-result" />
              <Select
                value={search.result ?? "all"}
                onValueChange={handleResultChange}
              >
                <SelectTrigger id="iqc-result" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resultOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="iqc-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="iqc-status" className="w-full text-xs">
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
          </div>

          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 text-xs"
              aria-expanded={isExpanded}
            >
              Mở rộng
              {advancedFilterCount > 0 && (
                <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                  {advancedFilterCount}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
            {/* Quyết định xử lý */}
            <div className="space-y-1.5">
              <FilterLabel label="Quyết định xử lý" htmlFor="iqc-disposition" />
              <Select
                value={search.disposition ?? "all"}
                onValueChange={handleDispositionChange}
              >
                <SelectTrigger id="iqc-disposition" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dispositionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nhà cung cấp */}
            <div className="space-y-1.5">
              <FilterLabel label="Nhà cung cấp" htmlFor="iqc-supplier" />
              <Select
                value={search.supplierId ?? "all"}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger id="iqc-supplier" className="w-full text-xs">
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

            {/* Mã NK */}
            <div className="space-y-1.5">
              <FilterLabel label="Mã NK" htmlFor="iqc-nk-code" />
              <Input
                id="iqc-nk-code"
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

            {/* PO */}
            <div className="space-y-1.5">
              <FilterLabel label="PO" htmlFor="iqc-po-code" />
              <Input
                id="iqc-po-code"
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
          </div>
        </CollapsibleContent>

        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5" />
            Xóa bộ lọc
          </Button>

          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
            <Download className="size-4" />
            Xuất Excel
          </PendingAction>

          <PendingAction
            label="Thêm IQC"
            hint="Tính năng tạo phiếu IQC sắp có"
            variant="default"
          >
            <Plus className="size-4" />
            Thêm IQC
          </PendingAction>
        </div>
      </Collapsible>
    </TooltipProvider>
  )
}
