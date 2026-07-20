import { useState } from "react"
import { Link } from "@tanstack/react-router"
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
import { ComboboxField } from "@/components/shared/ComboboxField"
import { PermissionGate } from "@/components/shared/PermissionGate"
import { useGetClientOptions } from "@/features/products/hooks/use-get-client-options"
import {
  PRODUCT_STATUS_LABELS,
  ProductStatus,
} from "@/features/products/types/product.type"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import type { ProductFilterOption } from "@/features/products/types/product.type"

const STATUS_FILTER_OPTIONS: {
  value: ProductStatus | "all"
  label: string
}[] = [
  { value: "all", label: "Tất cả" },
  { value: ProductStatus.ACTIVE, label: PRODUCT_STATUS_LABELS.ACTIVE },
  { value: ProductStatus.INACTIVE, label: PRODUCT_STATUS_LABELS.INACTIVE },
]

type ProductsTableFilterProps = {
  search: ProductsSearchSchema
  onFilterChange: (patch: Partial<ProductsSearchSchema>) => void
  productGroupOptions: ProductFilterOption[]
  clientOptions: ProductFilterOption[]
}

export function ProductsTableFilter({
  search,
  onFilterChange,
  productGroupOptions,
  clientOptions,
}: ProductsTableFilterProps) {
  const [q, setQ] = useState(search.q ?? "")

  const client = useGetClientOptions()
  const selectedClient = clientOptions.find(
    (option) => option.id === search.clientId
  )

  const commitSearch = () => {
    const trimmed = q.trim()
    onFilterChange({ q: trimmed.length > 0 ? trimmed : undefined })
  }

  const resetFilters = () => {
    setQ("")
    onFilterChange({
      q: undefined,
      status: undefined,
      clientId: undefined,
      productGroupId: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.6fr)_minmax(9rem,1fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)]">
          <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Tìm kiếm sản phẩm</span>
            <div className="relative">
              <Input
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo mã, tên sản phẩm, nhóm sản phẩm..."
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
              Khách hàng
            </span>
            <ComboboxField
              value={search.clientId}
              onValueChange={(next) => onFilterChange({ clientId: next })}
              options={client.options}
              onSearchChange={client.onSearchChange}
              isLoading={client.isFetching}
              initialOption={
                selectedClient
                  ? { value: selectedClient.id, label: selectedClient.name }
                  : undefined
              }
              emptyMessage="Không tìm thấy khách hàng"
              placeholder="Tìm khách hàng..."
              className="text-xs"
            />
          </label>

          <label className="space-y-1.5">
            <span className="block text-[11px] font-medium text-muted-foreground">
              Nhóm sản phẩm
            </span>
            <Select
              value={search.productGroupId ?? "all"}
              onValueChange={(next) =>
                onFilterChange({
                  productGroupId: next === "all" ? undefined : next,
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Tìm nhóm sản phẩm..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {productGroupOptions.map((option) => (
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
                  status: next === "all" ? undefined : (next as ProductStatus),
                })
              }
            >
              <SelectTrigger className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
          <PermissionGate permission="products:create">
            <Button asChild className="text-xs">
              <Link to="/manage/products/create">
                <Plus className="size-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </PermissionGate>
        </div>
      </div>
    </div>
  )
}
