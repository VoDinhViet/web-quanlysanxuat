import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import { FileSpreadsheet, Plus, Printer, RotateCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import { RoutePermissionGate } from "@/components/shared/RoutePermissionGate"

export function OutboundOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders" })
  const navigate = useNavigate({ from: "/manage/outbound-orders" })

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

  const handleExecuteSearch = () => {
    handleSearchDebounced.flush()
  }

  const resetFilters = () => {
    handleSearchDebounced.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const { q: _q, ...rest } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-card px-4 py-4 lg:px-5">
      <RoutePermissionGate route="/manage/outbound-orders/create">
        <Button asChild className="gap-1.5">
          <Link to="/manage/outbound-orders/create">
            <Plus className="size-4" />
            Tạo DO mới
          </Link>
        </Button>
      </RoutePermissionGate>

      <div className="w-72 space-y-1.5">
        <Label
          htmlFor="do-q"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Tìm kiếm
        </Label>
        <div className="relative">
          <Input
            id="do-q"
            className="pr-9 text-xs placeholder:text-muted-foreground/75"
            placeholder="Mã DO..."
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

      <div className="ml-auto flex items-center gap-2">
        <PendingAction label="Xuất Excel" hint="Tính năng xuất Excel sắp có">
          <FileSpreadsheet className="size-4 text-emerald-600" />
          Xuất Excel
        </PendingAction>

        <PendingAction
          label="In danh sách"
          hint="Tính năng in danh sách sắp có"
        >
          <Printer className="size-4 text-muted-foreground" />
          In danh sách
        </PendingAction>

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
    </div>
  )
}
