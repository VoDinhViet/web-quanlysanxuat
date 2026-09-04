import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
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
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import type { IqcResult } from "@/lib/types/iqc.type"
import { iqcResultLabels } from "@/lib/types/iqc.type"
import type { OqcDisposition, OqcStatus } from "@/lib/types/oqc.type"
import { oqcDispositionLabels, oqcStatusLabels } from "@/lib/types/oqc.type"
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

const dispositionOptions: SelectOption[] = [
  { value: "all", label: "Tất cả phương án xử lý" },
  ...buildOptionsFromLabels(oqcDispositionLabels),
]

// Không còn nút/tác vụ tạo OQC thủ công trên danh sách nữa — lối vào duy nhất giờ là nút
// "Yêu cầu OQC" ở header chi tiết Job (ProductionJobDetailHeader.tsx), gọi thẳng
// POST /production-jobs/:jobId/qc, không điều hướng sang màn OQC.
export function OqcTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/oqc/" })
  const navigate = useNavigate({ from: "/manage/oqc/" })

  const [q, setQ] = useState(search.q ?? "")

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

  const handleResultChange = (value: string) => {
    const result = value === "all" ? undefined : (value as IqcResult)
    void navigate({ search: (prev) => ({ ...prev, result, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as OqcStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleDispositionChange = (value: string) => {
    const disposition = value === "all" ? undefined : (value as OqcDisposition)
    void navigate({ search: (prev) => ({ ...prev, disposition, page: 1 }) })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
        page: 1,
      }),
    })
  }

  const handleExecuteSearch = () => {
    handleQChange.flush()
  }

  const resetFilters = () => {
    handleQChange.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          result: _result,
          status: _status,
          disposition: _disposition,
          startDate: _startDate,
          endDate: _endDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-card px-4 py-4 lg:px-5">
      <div className="w-56 space-y-1.5">
        <Label
          htmlFor="oqc-q"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Mã OQC
        </Label>
        <div className="relative">
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
      </div>

      <div className="w-36 space-y-1.5">
        <Label
          htmlFor="oqc-result"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Kết quả
        </Label>
        <Select
          selectedKey={search.result ?? "all"}
          onSelectionChange={(key) => handleResultChange(String(key))}
        >
          <SelectTrigger id="oqc-result" className="w-full text-xs">
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

      <div className="w-40 space-y-1.5">
        <Label
          htmlFor="oqc-status"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Trạng thái
        </Label>
        <Select
          selectedKey={search.status ?? "all"}
          onSelectionChange={(key) => handleStatusChange(String(key))}
        >
          <SelectTrigger id="oqc-status" className="w-full text-xs">
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

      <div className="w-44 space-y-1.5">
        <Label
          htmlFor="oqc-disposition"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Phương án xử lý
        </Label>
        <Select
          selectedKey={search.disposition ?? "all"}
          onSelectionChange={(key) => handleDispositionChange(String(key))}
        >
          <SelectTrigger id="oqc-disposition" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dispositionOptions.map((option) => (
              <SelectItem key={option.value} id={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-56 space-y-1.5">
        <Label
          htmlFor="oqc-daterange"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Từ ngày – Đến ngày
        </Label>
        <DateRangePicker
          id="oqc-daterange"
          from={search.startDate}
          to={search.endDate}
          onChange={handleDateRangeChange}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={resetFilters}
      >
        <RotateCw className="size-3.5" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}
