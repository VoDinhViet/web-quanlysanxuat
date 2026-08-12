import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
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
import { ComboboxField } from "@/components/shared/ComboboxField"
import { FilterLabel } from "@/components/shared/FilterLabel"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useGetClientOptions } from "@/features/clients/api"
import { itemStatusLabels } from "@/lib/types/item.type"
import type { ItemStatus } from "@/lib/types/item.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"

const statusOptions = buildOptionsFromLabels(itemStatusLabels)

export function MaterialsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/materials" })
  const navigate = useNavigate({ from: "/manage/materials" })

  const [q, setQ] = useState(search.q ?? "")

  // The route loader prefetches this hook's own q="" query, so `client.clients`
  // already has data on first render — no separate suspense query needed just
  // to seed the combobox's selected-label.
  const client = useGetClientOptions()
  const selectedClient = client.clients.find(
    (option) => option.id === search.clientId
  )

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

  const handleClientChange = (value: string | undefined) => {
    void navigate({
      search: (prev) => ({ ...prev, clientId: value, page: 1 }),
    })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as ItemStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
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
          clientId: _clientId,
          status: _status,
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
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(14rem,1.4fr)_minmax(9rem,1fr)]">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <FilterLabel label="Tìm kiếm" htmlFor="materials-search" />
            <div className="relative">
              <Input
                id="materials-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo mã, tên vật tư..."
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
            <FilterLabel label="Khách hàng" htmlFor="materials-client" />
            <ComboboxField
              id="materials-client"
              value={search.clientId}
              onValueChange={handleClientChange}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isPending={client.isFetching}
              initialOption={buildSelectOption(selectedClient)}
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <FilterLabel label="Trạng thái" htmlFor="materials-status" />
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="materials-status" className="w-full text-xs">
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
          <PermissionGate permission="items:create">
            <Button asChild className="text-xs">
              <Link to="/manage/materials/create">
                <Plus className="size-4" />
                Thêm vật tư
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
