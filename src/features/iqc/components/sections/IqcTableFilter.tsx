import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Download, ListFilter, Plus, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import type { IqcResult, IqcStatus } from "@/lib/types/iqc.type"
import { iqcResultLabels, iqcStatusLabels } from "@/lib/types/iqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const resultOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(iqcResultLabels),
]

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(iqcStatusLabels),
]

export function IqcTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/iqc/" })
  const navigate = useNavigate({ from: "/manage/iqc/" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  // Fields tucked behind the "Bộ lọc" popover — count so the trigger can hint they're active
  // even while the popover is closed.
  const activeFilterCount = [
    search.result,
    search.status,
    search.supplierId,
  ].filter(Boolean).length

  const [code, setCode] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // SupplierReturnsTableFilter.tsx. `replace: true` keeps rapid keystrokes from flooding history;
  // discrete Select changes below push instead so Back undoes them one at a time.
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

  const handleResultChange = (value: string) => {
    const result = value === "all" ? undefined : (value as IqcResult)
    void navigate({ search: (prev) => ({ ...prev, result, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as IqcStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleSupplierChange = (value: string) => {
    const supplierId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, supplierId, page: 1 }) })
  }

  const resetFilters = () => {
    // Cancel every debounce first — a call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleCodeChange.cancel()
    setCode("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          supplierId: _supplierId,
          result: _result,
          status: _status,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:flex-row lg:items-center lg:px-5">
      {/* Tìm theo mã IQC — ô search chính, luôn hiện; các field còn lại nằm trong popover "Bộ lọc" */}
      <div className="relative flex-1 lg:max-w-sm">
        <Input
          id="iqc-code"
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder="Nhập mã IQC..."
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            handleCodeChange(event.target.value)
          }}
        />
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PopoverTrigger>
          <Button type="button" variant="outline" className="text-xs">
            <ListFilter className="size-3.5" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Popover placement="bottom end" className="w-80 gap-3 sm:w-96">
            <p className="text-xs font-semibold text-foreground">Bộ lọc</p>

            <div className="grid grid-cols-2 gap-3">
              {/* Kết quả QC */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="iqc-result"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Kết quả QC
                </Label>
                <Select
                  value={search.result ?? "all"}
                  onChange={(key) => handleResultChange(String(key))}
                >
                  <SelectTrigger id="iqc-result" className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resultOptions.map((option) => (
                      <SelectItem key={option.value} id={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trạng thái */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="iqc-status"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Trạng thái
                </Label>
                <Select
                  value={search.status ?? "all"}
                  onChange={(key) => handleStatusChange(String(key))}
                >
                  <SelectTrigger id="iqc-status" className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} id={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nhà cung cấp */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="iqc-supplier"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Nhà cung cấp
                </Label>
                <Select
                  value={search.supplierId ?? "all"}
                  onChange={(key) => handleSupplierChange(String(key))}
                >
                  <SelectTrigger id="iqc-supplier" className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="all">Tất cả</SelectItem>
                    {supplierOptions.map((option) => (
                      <SelectItem key={option.id} id={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Popover>
        </PopoverTrigger>

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
    </div>
  )
}
