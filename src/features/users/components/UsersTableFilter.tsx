import { useState } from "react"
import { Filter, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
} from "@/features/users/types/user.type"
import type { UsersSearchSchema } from "@/features/users/schemas/users-search.schema"

const STATUS_FILTER_OPTIONS: {
  value: EmployeeStatus | "all"
  label: string
}[] = [
  { value: "all", label: "Tất cả" },
  { value: EmployeeStatus.WORKING, label: EMPLOYEE_STATUS_LABELS.WORKING },
  { value: EmployeeStatus.RESIGNED, label: EMPLOYEE_STATUS_LABELS.RESIGNED },
]

type UsersTableFilterProps = {
  search: UsersSearchSchema
  onFilterChange: (patch: Partial<UsersSearchSchema>) => void
}

export function UsersTableFilter({
  search,
  onFilterChange,
}: UsersTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const commitSearch = () => {
    const trimmed = q.trim()
    onFilterChange({ q: trimmed.length > 0 ? trimmed : undefined })
  }

  const resetFilters = () => {
    setQ("")
    onFilterChange({ q: undefined, status: undefined })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.8fr)_minmax(8rem,0.9fr)_auto]">
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm kiếm nhân sự</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo tên, email, SĐT, mã NV..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
                onBlur={commitSearch}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    commitSearch()
                  }
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  status: next === "all" ? undefined : (next as EmployeeStatus),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Button
            type="button"
            variant="outline"
            className="justify-center text-xs"
          >
            <Filter className="size-4" />
            Lọc nâng cao
          </Button>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
        </div>
      </div>
    </div>
  )
}
