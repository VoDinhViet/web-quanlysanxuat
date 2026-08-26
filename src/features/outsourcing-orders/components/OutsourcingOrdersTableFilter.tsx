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
import { Label } from "@/components/ui/label"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"
import {
  InventoryDocumentStatus,
  outsourcingOrderDocStatusLabels,
} from "@/lib/types/outsourcing-order.type"

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  {
    value: InventoryDocumentStatus.POSTED,
    label: outsourcingOrderDocStatusLabels[InventoryDocumentStatus.POSTED],
  },
  {
    value: InventoryDocumentStatus.CANCELLED,
    label: outsourcingOrderDocStatusLabels[InventoryDocumentStatus.CANCELLED],
  },
]

export function OutsourcingOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outsourcing-orders/" })
  const navigate = useNavigate({ from: "/manage/outsourcing-orders/" })

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
    void navigate({
      search: (prev) => ({
        ...prev,
        status:
          value === "all"
            ? undefined
            : (value as
                | InventoryDocumentStatus.POSTED
                | InventoryDocumentStatus.CANCELLED),
        page: 1,
      }),
    })
  }

  const handleExecuteSearch = () => {
    handleSearchDebounced.flush()
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
    <div className="flex flex-wrap items-end gap-3 bg-card px-4 py-4 lg:px-5">
      <RoutePermissionGate route="/manage/outsourcing-orders/create">
        <Button asChild className="gap-1.5">
          <Link to="/manage/outsourcing-orders/create">
            <Plus className="size-4" />
            Tạo phiếu gia công ngoài (OS-OUT)
          </Link>
        </Button>
      </RoutePermissionGate>

      <div className="w-72 space-y-1.5">
        <Label
          htmlFor="os-out-q"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Tìm kiếm
        </Label>
        <div className="relative">
          <Input
            id="os-out-q"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Mã phiếu..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              handleSearchDebounced()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleExecuteSearch()
              }
            }}
          />
          <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="w-40 space-y-1.5">
        <Label
          htmlFor="os-out-status"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Trạng thái
        </Label>
        <Select
          value={search.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="os-out-status" className="w-full text-xs">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-1.5 text-xs"
        onClick={resetFilters}
      >
        <RotateCw className="size-3.5" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}
