import { useState } from "react"
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
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import type { ProductsSearchSchema } from "@/features/products/schemas/products-search.schema"
import type {
  ProductFilterOption,
  ProductStatus,
} from "@/features/products/types/product.type"

const STATUS_FILTER_OPTIONS: {
  value: ProductStatus | "all"
  label: string
}[] = [
  { value: "all", label: "Tất cả" },
  { value: "ACTIVE", label: PRODUCT_STATUS_LABELS.ACTIVE },
  { value: "INACTIVE", label: PRODUCT_STATUS_LABELS.INACTIVE },
]

type ProductsTableFilterProps = {
  search: ProductsSearchSchema
  onFilterChange: (patch: Partial<ProductsSearchSchema>) => void
  productGroupOptions: ProductFilterOption[]
}

export function ProductsTableFilter({
  search,
  onFilterChange,
  productGroupOptions,
}: ProductsTableFilterProps) {
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
      productGroupId: undefined,
      order: undefined,
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-3 lg:grid-cols-[minmax(15rem,1.6fr)_minmax(9rem,1fr)_minmax(8rem,0.8fr)]">
          <label className="space-y-1.5 sm:col-span-3 lg:col-span-1">
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
          <Button type="button" variant="outline" className="text-xs">
            <Download className="size-4" />
            Xuất Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-4" />
            Làm mới
          </Button>
          <Button type="button" className="text-xs">
            <Plus className="size-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>
    </div>
  )
}
