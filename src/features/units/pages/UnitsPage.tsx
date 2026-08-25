import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { TableQueryError } from "@/components/shared/feedback/TableQueryError"
import { TableQueryLoading } from "@/components/shared/feedback/TableQueryLoading"
import { CreateUnitDialog } from "@/features/units/components/CreateUnitDialog"
import { UnitStatCards } from "@/features/units/components/UnitStatCards"
import { UnitsTable } from "@/features/units/components/UnitsTable"
import { unitsQueryOptions } from "@/features/units/api/options"
import type { UnitScope } from "@/lib/types/unit.type"

const scopeFilterValue = (scope: UnitScope | undefined) => scope ?? "ALL"

export function UnitsPage() {
  const search = useSearch({ from: "/(authed)/manage_/units" })
  const navigate = useNavigate({ from: "/manage/units" })

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
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Danh mục đơn vị tính"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Danh mục" },
          { label: "Đơn vị tính" },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <UnitStatCards />

        <Surface contentClassName="min-h-[calc(100svh-19rem)]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Input
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

              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={scopeFilterValue(search.scope)}
                onValueChange={handleScopeChange}
              >
                <ToggleGroupItem value="ALL" className="text-xs">
                  Tất cả
                </ToggleGroupItem>
                <ToggleGroupItem value="MATERIAL" className="text-xs">
                  Vật tư
                </ToggleGroupItem>
                <ToggleGroupItem value="PRODUCT" className="text-xs">
                  Sản phẩm
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <PermissionGate permission="items:create">
              <CreateUnitDialog
                trigger={
                  <Button size="sm" className="text-xs">
                    <Plus className="size-4" />
                    Thêm đơn vị tính
                  </Button>
                }
              />
            </PermissionGate>
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
    </main>
  )
}
