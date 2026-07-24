import { useState } from "react"
import { Link } from "@tanstack/react-router"
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
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useGetClientOptions } from "@/features/materials/hooks/use-get-client-options"
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_TYPE_LABELS,
} from "@/features/materials/types/material.type"
import type { MaterialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import type {
  MaterialRef,
  MaterialStatus,
  MaterialType,
} from "@/features/materials/types/material.type"
import { buildOptionsFromLabels, buildSelectOption } from "@/lib/utils"

const TYPE_OPTIONS = buildOptionsFromLabels(MATERIAL_TYPE_LABELS)
const STATUS_OPTIONS = buildOptionsFromLabels(MATERIAL_STATUS_LABELS)

type MaterialsTableFilterProps = {
  search: MaterialsSearchSchema
  onFilterChange: (
    patch: Partial<MaterialsSearchSchema>,
    options?: { replace?: boolean }
  ) => void
  materialGroupOptions: MaterialRef[]
  clientOptions: MaterialRef[]
}

export function MaterialsTableFilter({
  search,
  onFilterChange,
  materialGroupOptions,
  clientOptions,
}: MaterialsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const client = useGetClientOptions()
  const selectedClient = clientOptions.find(
    (option) => option.id === search.clientId
  )

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
      type: undefined,
      materialGroupId: undefined,
      clientId: undefined,
      status: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-4 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)]">
          <label className="space-y-1.5 sm:col-span-4 lg:col-span-1">
            <span className="sr-only">Tìm kiếm vật tư</span>
            <div className="relative">
              <Input
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
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Nhóm vật tư
            </span>
            <Select
              value={search.materialGroupId ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  materialGroupId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {materialGroupOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Loại vật tư
            </span>
            <Select
              value={search.type ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  type: next === "all" ? undefined : (next as MaterialType),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Khách hàng
            </span>
            <ComboboxField
              value={search.clientId}
              onValueChange={(next) => onFilterChange({ clientId: next })}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isLoading={client.isFetching}
              initialOption={buildSelectOption(selectedClient)}
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              className="text-xs"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  status: next === "all" ? undefined : (next as MaterialStatus),
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
          <PermissionGate permission="materials:create">
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
