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
import { Label } from "@/components/ui/label"
import { ComboboxField } from "@/components/shared/inputs/ComboboxField"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import { useGetClientOptions } from "@/features/clients/api"
import {
  itemStatusLabels,
  itemTypeLabels,
  ItemStatus,
  ItemType,
} from "@/lib/types/item.type"
import { buildSelectOption } from "@/lib/utils"

const statusFilterOptions: {
  value: ItemStatus | "all"
  label: string
}[] = [
  { value: "all", label: "Tất cả" },
  { value: ItemStatus.ACTIVE, label: itemStatusLabels.ACTIVE },
  { value: ItemStatus.INACTIVE, label: itemStatusLabels.INACTIVE },
]

const typeFilterOptions: {
  value: ItemType | "all"
  label: string
}[] = [
  { value: "all", label: "Tất cả" },
  {
    value: ItemType.FG,
    label: itemTypeLabels.FG,
  },
  {
    value: ItemType.WIP,
    label: itemTypeLabels.WIP,
  },
]

export function ProductsTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/products/" })
  const navigate = useNavigate({ from: "/manage/products/" })
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

  const handleTypeChange = (value: string) => {
    const type = value === "all" ? undefined : (value as ItemType)
    void navigate({ search: (prev) => ({ ...prev, type, page: 1 }) })
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
          type: _type,
          status: _status,
          clientId: _clientId,
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
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)_minmax(8rem,0.8fr)]">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label
              htmlFor="products-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="products-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo mã, tên sản phẩm..."
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
              htmlFor="products-client"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Khách hàng
            </Label>
            <ComboboxField
              id="products-client"
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
            <Label
              htmlFor="products-type"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Loại sản phẩm
            </Label>
            <Select
              value={search.type ?? "all"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="products-type" className="w-full text-xs">
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
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="products-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="products-status" className="w-full text-xs">
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

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 lg:ml-auto lg:w-auto lg:self-end">
          <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
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
          <RoutePermissionGate route="/manage/products/create">
            <Button asChild className="text-xs">
              <Link to="/manage/products/create">
                <Plus className="size-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </RoutePermissionGate>
        </div>
      </div>
    </div>
  )
}
