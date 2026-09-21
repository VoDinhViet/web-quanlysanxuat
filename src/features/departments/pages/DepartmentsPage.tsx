import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, Search } from "lucide-react"

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
import { Surface } from "@/components/shared/layouts/Surface"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateDepartmentDialog } from "@/features/departments/components/composites/CreateDepartmentDialog"
import { DepartmentsTable } from "@/features/departments/components/sections/DepartmentsTable"
import { departmentsQueryOptions } from "@/features/departments/api/options"

const statusFilterOptions = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Ngừng hoạt động" },
]

const getStatusFilterValue = (isActive: boolean | undefined) => {
  if (isActive === true) return "ACTIVE"
  if (isActive === false) return "INACTIVE"
  return "ALL"
}

export function DepartmentsPage() {
  const search = useSearch({ from: "/(authed)/manage_/departments/" })
  const navigate = useNavigate({ from: "/manage/departments/" })

  const [q, setQ] = useState(search.q ?? "")

  // `replace` so every debounced keystroke doesn't bury the pre-search page under history entries.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    void navigate({
      search: (prev) => ({
        ...prev,
        q: trimmed.length > 0 ? trimmed : undefined,
      }),
      replace: true,
    })
  }, 300)

  const handleStatusChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        isActive:
          value === "ACTIVE" ? true : value === "INACTIVE" ? false : undefined,
      }),
      replace: true,
    })
  }

  const departmentsQuery = useQuery({
    ...departmentsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-19rem)]">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(14rem,1.6fr)_10rem]">
            <div className="space-y-1.5">
              <Label
                htmlFor="departments-search"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Tìm kiếm
              </Label>
              <div className="relative">
                <Input
                  id="departments-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm theo mã, tên phòng ban..."
                  value={q}
                  onChange={(event) => {
                    setQ(event.target.value)
                    handleSearch(event.target.value)
                  }}
                />
                <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="departments-status"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Trạng thái
              </Label>
              <Select
                items={statusFilterOptions}
                value={getStatusFilterValue(search.isActive)}
                onValueChange={(value) =>
                  value !== null && handleStatusChange(value)
                }
              >
                <SelectTrigger
                  id="departments-status"
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

          <div className="flex w-full shrink-0 justify-end lg:ml-auto lg:w-auto lg:self-end">
            <PermissionGate permission="departments:create">
              <CreateDepartmentDialog
                trigger={
                  <Button className="text-xs">
                    <Plus className="size-4" />
                    Thêm phòng ban
                  </Button>
                }
              />
            </PermissionGate>
          </div>
        </div>

        {departmentsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : departmentsQuery.isError ? (
          <TableQueryError
            error={departmentsQuery.error.message}
            onRetry={() => void departmentsQuery.refetch()}
          />
        ) : (
          <DepartmentsTable
            rows={departmentsQuery.data.data}
            pagination={departmentsQuery.data.pagination}
            isPending={departmentsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}
