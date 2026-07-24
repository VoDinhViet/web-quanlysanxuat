import { useState } from "react"
import { Link } from "@tanstack/react-router"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { CLIENT_STATUS_LABELS } from "@/features/clients/types/client.type"
import type { ClientsSearchSchema } from "@/features/clients/schemas/clients-search.schema"
import type {
  ClientGroupRef,
  ClientStatus,
} from "@/features/clients/types/client.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const STATUS_OPTIONS = buildOptionsFromLabels(CLIENT_STATUS_LABELS)

type ClientsTableFilterProps = {
  search: ClientsSearchSchema
  onFilterChange: (
    patch: Partial<ClientsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  clientGroupOptions: ClientGroupRef[]
}

export function ClientsTableFilter({
  search,
  onFilterChange,
  clientGroupOptions,
}: ClientsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  // Filters as the user types, 300ms after the last keystroke — the same delay the
  // combobox option hooks use. An empty term becomes `undefined` so the search
  // schema's `.optional()` drops `q` from the URL entirely.
  const handleSearch = useDebounceCallback((term: string) => {
    const trimmed = term.trim()
    onFilterChange(
      { q: trimmed.length > 0 ? trimmed : undefined },
      { replace: true }
    )
  }, 300)

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the
    // user just cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    onFilterChange({
      q: undefined,
      status: undefined,
      clientGroupId: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.8fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)]">
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm kiếm khách hàng</span>
            <div className="relative">
              <Input
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
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Nhóm khách hàng
            </span>
            <Select
              value={search.clientGroupId ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  clientGroupId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
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
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  status: next === "all" ? undefined : (next as ClientStatus),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {/* Khu vực is a visual placeholder — the backend has no region field
              on clients yet, so the filter is disabled until that exists. */}
          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Khu vực
            </span>
            <Select value="all" disabled>
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:w-auto lg:self-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button
                    type="button"
                    variant="outline"
                    className="pointer-events-none text-xs"
                    disabled
                  >
                    <Download className="size-4" />
                    Xuất Excel
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Tính năng xuất Excel sắp có</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
          <PermissionGate permission="clients:create">
            <Button asChild className="text-xs">
              <Link to="/manage/clients/create">
                <Plus className="size-4" />
                Tạo khách hàng
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
