import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { RotateCw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { departmentQueryOptions } from "@/features/departments/api"
import { heldRequisitionTypeLabels } from "@/lib/types/held-requisition.type"
import type {
  HeldRequisitionType,
  HeldRequisitionsSearch,
} from "@/lib/types/held-requisition.type"
import { buildOptionsFromLabels, buildSelectOptions } from "@/lib/utils"

const typeOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(heldRequisitionTypeLabels),
]

type HeldRequisitionsFilterProps = {
  search: HeldRequisitionsSearch
  onSearchChange: (patch: Partial<HeldRequisitionsSearch>) => void
  onRefresh: () => void
}

// Tìm theo mã phiếu, mã Job, số PO hoặc lý do; lọc theo bộ phận và loại phiếu. Không có ô Trạng
// thái: chỉ phiếu `APPROVED` mới giữ vật tư nên ô đó luôn ra đúng một giá trị. "Làm mới" xoá bộ
// lọc và đọc lại dữ liệu.
export function HeldRequisitionsFilter({
  search,
  onSearchChange,
  onRefresh,
}: HeldRequisitionsFilterProps) {
  const { data: departments = [] } = useQuery(departmentQueryOptions())
  const departmentFilterOptions = [
    { value: "all", label: "Tất cả" },
    ...buildSelectOptions(departments),
  ]
  const [q, setQ] = useState(search.q ?? "")

  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onSearchChange({ q: trimmed.length > 0 ? trimmed : undefined })
  }, 300)

  const clearSearch = () => {
    setQ("")
    handleSearch.cancel()
    onSearchChange({ q: undefined })
  }

  const handleRefresh = () => {
    handleSearch.cancel()
    setQ("")
    onRefresh()
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="held-requisitions-search"
            className="text-xs font-medium text-muted-foreground"
          >
            Tìm kiếm
          </Label>
          <div className="relative">
            <Input
              id="held-requisitions-search"
              className="pr-9 text-xs placeholder:text-muted-foreground/75"
              placeholder="Mã phiếu, Job, PO, lý do..."
              value={q}
              onChange={(event) => {
                setQ(event.target.value)
                handleSearch(event.target.value)
              }}
            />
            {q ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xóa từ khóa"
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="size-3.5" />
              </Button>
            ) : (
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="held-requisitions-department"
            className="text-xs font-medium text-muted-foreground"
          >
            Bộ phận
          </Label>
          <Select
            items={departmentFilterOptions}
            value={search.departmentId ?? "all"}
            onValueChange={(value) =>
              value !== null &&
              onSearchChange({
                departmentId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger
              id="held-requisitions-department"
              className="w-full text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departmentFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="held-requisitions-type"
            className="text-xs font-medium text-muted-foreground"
          >
            Loại phiếu
          </Label>
          <Select
            items={typeOptions}
            value={search.type ?? "all"}
            onValueChange={(value) =>
              value !== null &&
              onSearchChange({
                type:
                  value === "all" ? undefined : (value as HeldRequisitionType),
              })
            }
          >
            <SelectTrigger
              id="held-requisitions-type"
              className="w-full text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="shrink-0 gap-1.5 text-xs"
        onClick={handleRefresh}
      >
        <RotateCw className="size-3.5" />
        Làm mới
      </Button>
    </div>
  )
}
