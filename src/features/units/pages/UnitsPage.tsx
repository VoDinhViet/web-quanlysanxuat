import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
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
import { CreateUnitDialog } from "@/features/units/components/composites/CreateUnitDialog"
import { UnitsTable } from "@/features/units/components/sections/UnitsTable"
import { unitsQueryOptions } from "@/features/units/api/options"
import type { UnitScope } from "@/lib/types/unit.type"

const scopeFilterValue = (scope: UnitScope | undefined) => scope ?? "ALL"

export function UnitsPage() {
  const search = useSearch({ from: "/(authed)/manage_/units/" })
  const navigate = useNavigate({ from: "/manage/units/" })

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

  const handleScopeChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        scope:
          value === "ALL" || value === "" ? undefined : (value as UnitScope),
      }),
      replace: true,
    })
  }

  const unitsQuery = useQuery(unitsQueryOptions(search))

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-19rem)]">
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(14rem,1.6fr)_8rem]">
            <div className="space-y-1.5">
              <Label
                htmlFor="units-search"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Tìm kiếm
              </Label>
              <div className="relative">
                <Input
                  id="units-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm theo mã, tên đơn vị tính..."
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
              <Label
                htmlFor="units-scope"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Phạm vi
              </Label>
              <Select
                value={scopeFilterValue(search.scope)}
                onValueChange={handleScopeChange}
              >
                <SelectTrigger id="units-scope" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="MATERIAL">Vật tư</SelectItem>
                  <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full shrink-0 justify-end lg:ml-auto lg:w-auto lg:self-end">
            <PermissionGate permission="items:create">
              <CreateUnitDialog
                trigger={
                  <Button className="text-xs">
                    <Plus className="size-4" />
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
          <UnitsTable
            rows={unitsQuery.data}
            isPending={unitsQuery.isFetching}
          />
        )}
      </Surface>
    </div>
  )
}
