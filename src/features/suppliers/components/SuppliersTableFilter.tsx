import { useState } from "react"
import { Link } from "@tanstack/react-router"
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
import { PermissionGate } from "@/components/shared/PermissionGate"
import { SUPPLIER_STATUS_LABELS } from "@/features/suppliers/types/supplier.type"
import type { SuppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import type {
  CountryRef,
  SupplierGroupRef,
  SupplierStatus,
} from "@/features/suppliers/types/supplier.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const STATUS_OPTIONS = buildOptionsFromLabels(SUPPLIER_STATUS_LABELS)

type SuppliersTableFilterProps = {
  search: SuppliersSearchSchema
  onFilterChange: (patch: Partial<SuppliersSearchSchema>) => void
  supplierGroupOptions: SupplierGroupRef[]
  countryOptions: CountryRef[]
}

export function SuppliersTableFilter({
  search,
  onFilterChange,
  supplierGroupOptions,
  countryOptions,
}: SuppliersTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const commitSearch = () => {
    const trimmed = q.trim()
    onFilterChange({ q: trimmed.length > 0 ? trimmed : undefined })
  }

  const resetFilters = () => {
    setQ("")
    onFilterChange({
      q: undefined,
      status: undefined,
      supplierGroupId: undefined,
      countryId: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-4 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)]">
          <label className="space-y-1.5 sm:col-span-4 lg:col-span-1">
            <span className="sr-only">Tìm kiếm nhà cung cấp</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm kiếm theo mã, tên, mã số thuế, người liên hệ..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
                onBlur={commitSearch}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    commitSearch()
                  }
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Trạng thái
            </span>
            <Select
              value={search.status ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  status: next === "all" ? undefined : (next as SupplierStatus),
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

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Nhóm NCC
            </span>
            <Select
              value={search.supplierGroupId ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  supplierGroupId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
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
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Quốc gia
            </span>
            <Select
              value={search.countryId ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  countryId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
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
          <PermissionGate permission="suppliers:create">
            <Button asChild className="text-xs">
              <Link to="/manage/suppliers/create">
                <Plus className="size-4" />
                Thêm nhà cung cấp
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
