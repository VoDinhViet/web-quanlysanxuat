import { useState } from "react"
import { useDebounceCallback } from "usehooks-ts"
import { Download, RotateCw, Search } from "lucide-react"

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
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import type {
  InventoryIssueStatus,
  InventoryIssueType,
} from "@/lib/types/inventory-issue.type"
import {
  inventoryIssueStatusLabels,
  inventoryIssueTypeLabels,
} from "@/lib/types/inventory-issue.type"
import type { InventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const issueTypeOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryIssueTypeLabels),
]

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryIssueStatusLabels),
]

type InventoryIssuesFilters = Pick<
  InventoryIssuesSearchSchema,
  "q" | "issueType" | "status" | "startDate" | "endDate"
>

type InventoryIssuesTableFilterProps = {
  search: InventoryIssuesFilters
  // The page owns the route, so it applies the patch to its own search params (and resets `page`).
  onSearchChange: (
    patch: Partial<InventoryIssuesFilters>,
    replace?: boolean
  ) => void
  // Finished-goods issues are always SALES, so that page hides the type filter.
  showIssueType?: boolean
}

export function InventoryIssuesTableFilter({
  search,
  onSearchChange,
  showIssueType = true,
}: InventoryIssuesTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange({ q: trimmed.length > 0 ? trimmed : undefined }, true)
  }, 300)

  const handleIssueTypeChange = (value: string) => {
    onSearchChange({
      issueType: value === "all" ? undefined : (value as InventoryIssueType),
    })
  }

  const handleStatusChange = (value: string) => {
    onSearchChange({
      status: value === "all" ? undefined : (value as InventoryIssueStatus),
    })
  }

  const handleDateRangeChange = (
    startDate: string | undefined,
    endDate: string | undefined
  ) => {
    onSearchChange({ startDate, endDate })
  }

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    onSearchChange({
      q: undefined,
      issueType: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div
          className={cn(
            "grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(12rem,1.2fr)]",
            !showIssueType &&
              "xl:grid-cols-[minmax(14rem,1.4fr)_minmax(10rem,1fr)_minmax(12rem,1.2fr)]"
          )}
        >
          {/* Tìm kiếm */}
          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="xk-search"
              className="text-xs font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="xk-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Mã phiếu, lý do/PO, Job/LSX, mã/tên vật tư..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* Loại phiếu */}
          {showIssueType && (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="xk-issue-type"
                className="text-xs font-medium text-muted-foreground"
              >
                Loại phiếu
              </Label>
              <Select
                items={issueTypeOptions}
                value={search.issueType ?? "all"}
                onValueChange={(value) =>
                  value !== null && handleIssueTypeChange(value)
                }
              >
                <SelectTrigger id="xk-issue-type" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issueTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="xk-status"
              className="text-xs font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              items={statusOptions}
              value={search.status ?? "all"}
              onValueChange={(value) =>
                value !== null && handleStatusChange(value)
              }
            >
              <SelectTrigger id="xk-status" className="w-full text-xs">
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

          {/* Từ ngày – Đến ngày */}
          <div className="space-y-1.5">
            <Label
              htmlFor="xk-date-range"
              className="text-xs font-medium text-muted-foreground"
            >
              Từ ngày – Đến ngày
            </Label>
            <DateRangePicker
              id="xk-date-range"
              from={search.startDate}
              to={search.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
            <Download className="size-4" />
            Xuất Excel
          </PendingAction>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
