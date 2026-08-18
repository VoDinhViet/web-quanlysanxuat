import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { supplierGroupOptionsQueryOptions } from "@/features/suppliers/api/options"
import { supplierStatusLabels } from "@/lib/types/supplier.type"
import type { SupplierStatus } from "@/lib/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = buildOptionsFromLabels(supplierStatusLabels)

export function SuppliersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/suppliers" })
  const navigate = useNavigate({ from: "/manage/suppliers" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierGroupOptions } = useSuspenseQuery(
    supplierGroupOptionsQueryOptions()
  )
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — the same delay the
  // combobox option hooks use. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely.
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
    const status = value === "all" ? undefined : (value as SupplierStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleGroupChange = (value: string) => {
    const supplierGroupId = value === "all" ? undefined : value
    void navigate({
      search: (prev) => ({ ...prev, supplierGroupId, page: 1 }),
    })
  }

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the
    // user just cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          supplierGroupId: _supplierGroupId,
          order: _order,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-3 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-3 lg:col-span-1">
            <FilterLabel label="Tìm kiếm" htmlFor="suppliers-search" />
            <div className="relative">
              <Input
                id="suppliers-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo mã, tên, mã số thuế, người liên hệ..."
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
            <FilterLabel label="Trạng thái" htmlFor="suppliers-status" />
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="suppliers-status" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <FilterLabel label="Nhóm NCC" htmlFor="suppliers-group" />
            <Select
              value={search.supplierGroupId ?? "all"}
              onValueChange={handleGroupChange}
            >
              <SelectTrigger id="suppliers-group" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {supplierGroupOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <RoutePermissionGate route="/manage/suppliers/create">
            <Button asChild className="text-xs">
              <Link to="/manage/suppliers/create">
                <Plus className="size-4" />
                Thêm nhà cung cấp
              </Link>
            </Button>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
