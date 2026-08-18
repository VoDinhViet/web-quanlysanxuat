import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { Download, Plus, RotateCw, Search } from "lucide-react"

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
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { employeeStatusLabels } from "@/lib/types/user.type"
import type { EmployeeStatus } from "@/lib/types/user.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { SelectOption } from "@/lib/utils"

const statusFilterOptions: SelectOption[] = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(employeeStatusLabels),
]

export function UsersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/users" })
  const navigate = useNavigate({ from: "/manage/users" })
  const [q, setQ] = useState(search.q ?? "")

  const handleSearch = useDebounceCallback((term: string) => {
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

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as EmployeeStatus)
    void navigate({
      search: (prev) => ({ ...prev, status, page: 1 }),
    })
  }

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const { q: _q, status: _status, ...rest } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.8fr)_minmax(8rem,0.9fr)]">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="users-search-input" />
              <div className="relative">
                <Input
                  id="users-search-input"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm kiếm theo tên, email, SĐT, mã NV..."
                  value={q}
                  onChange={(event) => {
                    setQ(event.target.value)
                    handleSearch(event.target.value)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      handleSearch.flush()
                    }
                  }}
                />
                <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="users-status-select" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger
                  id="users-status-select"
                  className="w-full text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
            <PendingAction
              label="Xuất Excel"
              hint="Tính năng xuất Excel sắp có"
            >
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
              Làm mới
            </Button>
            <RoutePermissionGate route="/manage/users/create">
              <Button asChild className="text-xs">
                <Link to="/manage/users/create">
                  <Plus className="size-4" />
                  Thêm nhân sự
                </Link>
              </Button>
            </RoutePermissionGate>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
