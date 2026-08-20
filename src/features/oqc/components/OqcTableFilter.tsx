import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
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
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import type { IqcResult } from "@/lib/types/iqc.type"
import { iqcResultLabels } from "@/lib/types/iqc.type"
import type { OqcStatus } from "@/lib/types/oqc.type"
import { oqcStatusLabels } from "@/lib/types/oqc.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const resultOptions: SelectOption[] = [
  { value: "all", label: "Tất cả kết quả" },
  ...buildOptionsFromLabels(iqcResultLabels),
]

const statusOptions: SelectOption[] = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(oqcStatusLabels),
]

export function OqcTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/oqc" })
  const navigate = useNavigate({ from: "/manage/oqc" })

  const activeFilterCount = [
    search.materialKeyword,
    search.result,
    search.status,
    search.fromDate,
    search.toDate,
  ].filter(Boolean).length

  const [q, setQ] = useState(search.q ?? "")
  const [materialKeyword, setMaterialKeyword] = useState(
    search.materialKeyword ?? ""
  )

  const handleQChange = useDebounceCallback((term: string) => {
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

  const handleResultChange = (value: string) => {
    const result = value === "all" ? undefined : (value as IqcResult)
    void navigate({ search: (prev) => ({ ...prev, result, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as OqcStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
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

  const handleExecuteSearch = () => {
    handleQChange.flush()
  }

  const resetFilters = () => {
    handleQChange.cancel()
    handleMaterialKeywordChange.cancel()
    setQ("")
    setMaterialKeyword("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          materialKeyword: _materialKeyword,
          result: _result,
          status: _status,
          fromDate: _fromDate,
          toDate: _toDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-3 bg-card px-4 py-3.5 lg:flex-row lg:items-center lg:px-5">
      <div className="relative flex-1 lg:max-w-xs">
        <Input
          id="oqc-q"
          className="pr-9 text-xs placeholder:text-muted-foreground/75"
          placeholder="Nhập mã OQC..."
          value={q}
          onChange={(event) => {
            setQ(event.target.value)
            handleQChange(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              handleExecuteSearch()
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
              <div className="col-span-2 space-y-1.5">
                <Label
                  htmlFor="oqc-material-keyword"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Tìm theo vật tư
                </Label>
                <Input
                  id="oqc-material-keyword"
                  className="text-xs placeholder:text-muted-foreground/75"
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
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="oqc-result"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Kết quả
                </Label>
                <Select
                  value={search.result ?? "all"}
                  onValueChange={handleResultChange}
                >
                  <SelectTrigger id="oqc-result" className="w-full text-xs">
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="oqc-status"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Trạng thái
                </Label>
                <Select
                  value={search.status ?? "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger id="oqc-status" className="w-full text-xs">
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

              <div className="col-span-2 space-y-1.5">
                <Label
                  htmlFor="oqc-daterange"
                  className="text-[11px] font-medium text-muted-foreground"
                >
                  Từ ngày – Đến ngày
                </Label>
                <DateRangePicker
                  id="oqc-daterange"
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
          label="Yêu cầu QC"
          hint="Tính năng yêu cầu QC sắp có"
          variant="default"
        >
          <Plus className="size-4" />
          Yêu cầu QC
        </PendingAction>
      </div>
    </div>
  )
}
