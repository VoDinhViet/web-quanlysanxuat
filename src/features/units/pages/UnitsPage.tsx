import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { AddCircle, CloseCircle, Magnifer } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { CreateUnitDialog } from "@/features/units/components/composites/CreateUnitDialog"
import { UnitsTable } from "@/features/units/components/sections/UnitsTable"
import { unitsQueryOptions } from "@/features/units/api/options"
import { unitStatusLabels, unitTypeLabels } from "@/lib/types/unit.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { UnitStatus, UnitType } from "@/lib/types/unit.type"

const typeFilterOptions = [
  { value: "all", label: "Tất cả loại" },
  ...buildOptionsFromLabels(unitTypeLabels),
]

const statusFilterOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(unitStatusLabels),
]

export function UnitsPage() {
  const search = useSearch({ from: "/(authed)/manage_/settings/units" })
  const navigate = useNavigate({ from: "/manage/settings/units" })

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

  const handleTypeChange = (value: string) => {
    const type = value === "all" ? undefined : (value as UnitType)
    void navigate({ search: (prev) => ({ ...prev, type }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as UnitStatus)
    void navigate({ search: (prev) => ({ ...prev, status }) })
  }

  const hasFilters = Boolean(search.q ?? search.type ?? search.status)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the user just cleared.
    handleSearch.cancel()
    setQ("")
    void navigate({ search: {}, replace: true })
  }

  const unitsQuery = useQuery(unitsQueryOptions(search))

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
        <div className="relative w-full sm:w-64">
          <Input
            aria-label="Tìm đơn vị tính"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Tìm kiếm mã, tên đơn vị tính..."
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              handleSearch(event.target.value)
            }}
          />
          <Magnifer className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Select
          items={typeFilterOptions}
          value={search.type ?? "all"}
          onValueChange={(value) => value !== null && handleTypeChange(value)}
        >
          <SelectTrigger aria-label="Lọc theo loại" className="w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={statusFilterOptions}
          value={search.status ?? "all"}
          onValueChange={(value) => value !== null && handleStatusChange(value)}
        >
          <SelectTrigger
            aria-label="Lọc theo trạng thái"
            className="w-44 text-xs"
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
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            <CloseCircle className="size-4" />
            Xóa lọc
          </Button>
        )}

        <div className="ml-auto">
          <PermissionGate permission="items:create">
            <CreateUnitDialog
              trigger={
                <Button className="shrink-0 text-xs">
                  <AddCircle className="size-4" />
                  Thêm đơn vị tính
                </Button>
              }
            />
          </PermissionGate>
        </div>
      </div>

      {unitsQuery.isPending ? (
        <TableQueryLoading rows={5} />
      ) : unitsQuery.isError ? (
        <TableQueryError
          error={unitsQuery.error.message}
          onRetry={() => void unitsQuery.refetch()}
        />
      ) : (
        <UnitsTable rows={unitsQuery.data} isPending={unitsQuery.isFetching} />
      )}
    </div>
  )
}
