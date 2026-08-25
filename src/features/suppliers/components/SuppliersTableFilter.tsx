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
import { Label } from "@/components/ui/label"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { countryOptionsQueryOptions } from "@/features/countries/api"
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
  const { data: countryOptions } = useSuspenseQuery(
    countryOptionsQueryOptions()
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

  const handleCountryChange = (value: string) => {
    const countryId = value === "all" ? undefined : value
    void navigate({
      search: (prev) => ({ ...prev, countryId, page: 1 }),
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
          countryId: _countryId,
          order: _order,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label
              htmlFor="suppliers-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
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
            <Label
              htmlFor="suppliers-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
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
            <Label
              htmlFor="suppliers-group"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Nhóm NCC
            </Label>
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

          <div className="space-y-1.5">
            <Label
              htmlFor="suppliers-country"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Quốc gia
            </Label>
            <Select
              value={search.countryId ?? "all"}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger id="suppliers-country" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {countryOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
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
