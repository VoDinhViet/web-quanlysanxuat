import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
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
import { clientGroupOptionsQueryOptions } from "@/features/clients/api/options"
import { clientStatusLabels } from "@/lib/types/client.type"
import type { ClientStatus } from "@/lib/types/client.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const statusOptions = buildOptionsFromLabels(clientStatusLabels)

export function ClientsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/clients" })
  const navigate = useNavigate({ from: "/manage/clients" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: clientGroupOptions } = useSuspenseQuery(
    clientGroupOptionsQueryOptions()
  )
  const [q, setQ] = useState(search.q ?? "")

  // `replace` is for the search box: it commits on every debounced keystroke, and
  // pushing each one would bury the pre-search page under a dozen history entries.
  // Discrete filters (the selects) stay on push so Back undoes them one by one.
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

  const handleGroupChange = (value: string) => {
    const clientGroupId = value === "all" ? undefined : value
    void navigate({ search: (prev) => ({ ...prev, clientGroupId, page: 1 }) })
  }

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as ClientStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          clientGroupId: _clientGroupId,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.8fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FilterLabel label="Tìm kiếm" htmlFor="clients-search" />
              <div className="relative">
                <Input
                  id="clients-search"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Tìm kiếm theo mã KH, tên, MST, SĐT, email..."
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
              <FilterLabel label="Nhóm khách hàng" htmlFor="clients-group" />
              <Select
                value={search.clientGroupId ?? "all"}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger id="clients-group" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {clientGroupOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="clients-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="clients-status" className="w-full text-xs">
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

            {/* Khu vực is a visual placeholder — the backend has no region field
                on clients yet, so the filter is disabled until that exists. */}
            <div className="space-y-1.5">
              <FilterLabel label="Khu vực" htmlFor="clients-region" />
              <Select value="all" disabled>
                <SelectTrigger id="clients-region" className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
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
            <RoutePermissionGate route="/manage/clients/create">
              <Button asChild className="text-xs">
                <Link to="/manage/clients/create">
                  <Plus className="size-4" />
                  Tạo khách hàng
                </Link>
              </Button>
            </RoutePermissionGate>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
