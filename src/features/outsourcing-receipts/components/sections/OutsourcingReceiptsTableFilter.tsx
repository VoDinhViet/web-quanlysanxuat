import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Plus, RotateCw, Search } from "lucide-react"

import { Button, LinkButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { RoutePermissionGate } from "@/components/shared/primitives/RoutePermissionGate"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import {
  InventoryDocumentStatus,
  outsourcingReceiptStatusLabels,
} from "@/lib/types/outsourcing-receipt.type"

// `outsourcing_receipts.status` giờ là enum riêng bên BE (OutsourcingReceiptStatus, chỉ
// POSTED/CANCELLED — "không có nháp", docs/decisions/outsourcing-no-draft.md), không còn
// DRAFT như `InventoryDocumentStatus` (dùng chung, 3 giá trị) FE vẫn khai. Liệt kê tường minh
// POSTED/CANCELLED thay vì buildOptionsFromLabels(outsourcingReceiptStatusLabels) — filter gửi
// status=DRAFT sẽ bị BE validator từ chối (400).
const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  {
    value: InventoryDocumentStatus.POSTED,
    label: outsourcingReceiptStatusLabels[InventoryDocumentStatus.POSTED],
  },
  {
    value: InventoryDocumentStatus.CANCELLED,
    label: outsourcingReceiptStatusLabels[InventoryDocumentStatus.CANCELLED],
  },
]

const requiresIqcOptions = [
  { value: "all", label: "Tất cả (Yêu cầu QC)" },
  { value: "true", label: "Có yêu cầu QC" },
  { value: "false", label: "Không yêu cầu QC" },
]

export function OutsourcingReceiptsTableFilter() {
  const search = useSearch({
    from: "/(authed)/manage_/outsourcing-receipts/",
  })
  const navigate = useNavigate({ from: "/manage/outsourcing-receipts/" })

  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

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

  const handleSupplierChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        supplierId: value === "all" ? undefined : value,
        page: 1,
      }),
    })
  }

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

  const handleRequiresIqcChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        requiresIqc: value === "all" ? undefined : value === "true",
        page: 1,
      }),
    })
  }

  const handleDateRangeChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
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
        const {
          q: _q,
          supplierId: _supplierId,
          status: _status,
          requiresIqc: _requiresIqc,
          startDate: _startDate,
          endDate: _endDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 bg-card px-4 py-4 lg:px-5">
      <RoutePermissionGate route="/manage/outsourcing-receipts/create">
        <LinkButton
          to="/manage/outsourcing-receipts/create"
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Lập phiếu OS-IN
        </LinkButton>
      </RoutePermissionGate>

      <div className="w-56 space-y-1.5">
        <Label
          htmlFor="os-in-q"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Tìm kiếm
        </Label>
        <div className="relative">
          <Input
            id="os-in-q"
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
          htmlFor="os-in-supplier"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Nhà cung cấp
        </Label>
        <Select
          selectedKey={search.supplierId ?? "all"}
          onSelectionChange={(key) => handleSupplierChange(String(key))}
          placeholder="Chọn nhà cung cấp"
        >
          <SelectTrigger id="os-in-supplier" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="all">Tất cả NCC</SelectItem>
            {supplierOptions.map((option) => (
              <SelectItem key={option.id} id={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36 space-y-1.5">
        <Label
          htmlFor="os-in-status"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Trạng thái
        </Label>
        <Select
          selectedKey={search.status ?? "all"}
          onSelectionChange={(key) => handleStatusChange(String(key))}
          placeholder="Chọn trạng thái"
        >
          <SelectTrigger id="os-in-status" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} id={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40 space-y-1.5">
        <Label
          htmlFor="os-in-requires-iqc"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Yêu cầu QC
        </Label>
        <Select
          selectedKey={
            search.requiresIqc === undefined
              ? "all"
              : String(search.requiresIqc)
          }
          onSelectionChange={(key) => handleRequiresIqcChange(String(key))}
          placeholder="Chọn yêu cầu QC"
        >
          <SelectTrigger id="os-in-requires-iqc" className="w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {requiresIqcOptions.map((opt) => (
              <SelectItem key={opt.value} id={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-56 space-y-1.5">
        <Label
          htmlFor="os-in-daterange"
          className="text-[11px] font-medium text-muted-foreground"
        >
          Từ ngày – Đến ngày
        </Label>
        <DateRangePicker
          id="os-in-daterange"
          from={search.startDate}
          to={search.endDate}
          onChange={handleDateRangeChange}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="gap-1.5 text-xs"
        onPress={resetFilters}
      >
        <RotateCw className="size-3.5" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}
