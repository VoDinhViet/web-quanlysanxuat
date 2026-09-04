import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { FileOutput, RotateCw, Search } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { inventoryRequisitionStatusLabels } from "@/lib/types/inventory-requisition.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { InventoryRequisitionStatus } from "@/lib/types/inventory-requisition.type"

const statusOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(inventoryRequisitionStatusLabels),
]

export function InventoryRequisitionsTableFilter() {
  const search = useSearch({
    from: "/(authed)/manage_/inventory-requisitions/",
  })
  const navigate = useNavigate({ from: "/manage/inventory-requisitions/" })

  const [q, setQ] = useState(search.q ?? "")

  const handleSearchDebounced = useDebounceCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: q.trim().length > 0 ? q.trim() : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : (value as InventoryRequisitionStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const resetFilters = () => {
    handleSearchDebounced.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const { q: _q, status: _status, ...rest } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-5 bg-card px-4 py-4 lg:px-5">
      <div className="border-b border-border/60 pb-4">
        <p className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Tạo phiếu lãnh
        </p>
        <div className="flex flex-wrap gap-2">
          <RoutePermissionGate route="/manage/inventory-requisitions/create">
            <LinkButton
              to="/manage/inventory-requisitions/create"
              className="text-xs"
            >
              <FileOutput className="size-3.5" />
              Tạo phiếu lãnh
            </LinkButton>
          </RoutePermissionGate>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(12rem,1.2fr)]">
          <div className="space-y-1.5">
            <Label
              htmlFor="lv-code"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Mã phiếu lãnh
            </Label>
            <div className="relative">
              <Input
                id="lv-code"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Nhập mã phiếu lãnh..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearchDebounced()
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="lv-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              value={search.status ?? "all"}
              onChange={(key) => handleStatusChange(String(key))}
            >
              <SelectTrigger id="lv-status" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} id={option.value}>
                    {option.label}
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
            Xóa bộ lọc
          </Button>
        </div>
      </div>
    </div>
  )
}
