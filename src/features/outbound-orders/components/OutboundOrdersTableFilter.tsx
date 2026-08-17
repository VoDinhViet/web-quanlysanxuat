import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"
import {
  FileSpreadsheet,
  HelpCircle,
  Plus,
  Printer,
  RotateCw,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { FilterLabel } from "@/components/shared/inputs/FilterLabel"
import { PendingAction } from "@/components/shared/buttons/PendingAction"
import type {
  OutboundDeliveryMethod,
  OutboundOrderStatus,
} from "@/lib/types/outbound-order.type"
import {
  outboundDeliveryMethodLabels,
  outboundOrderStatusLabels,
} from "@/lib/types/outbound-order.type"
import { buildOptionsFromLabels } from "@/lib/utils"

const clientOptions = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "ABC Electronics", label: "ABC Electronics" },
  { value: "DEF Tech", label: "DEF Tech" },
  { value: "GHI Industry", label: "GHI Industry" },
  { value: "JKL Co., Ltd", label: "JKL Co., Ltd" },
  { value: "MNO Solutions", label: "MNO Solutions" },
  { value: "PQR Vietnam", label: "PQR Vietnam" },
]

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  ...buildOptionsFromLabels(outboundOrderStatusLabels),
]

const methodOptions = [
  { value: "all", label: "Tất cả hình thức" },
  ...buildOptionsFromLabels(outboundDeliveryMethodLabels),
]

const limitOptions = [
  { value: 10, label: "10 / trang" },
  { value: 20, label: "20 / trang" },
  { value: 50, label: "50 / trang" },
]

export function OutboundOrdersTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/outbound-orders" })
  const navigate = useNavigate({ from: "/manage/outbound-orders" })

  const [q, setQ] = useState(search.q ?? "")
  const [poCode, setPoCode] = useState(search.poCode ?? "")
  const [productCode, setProductCode] = useState(search.productCode ?? "")
  const [productName, setProductName] = useState(search.productName ?? "")

  const handleSearchDebounced = useDebounceCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: q.trim().length > 0 ? q.trim() : undefined,
        poCode: poCode.trim().length > 0 ? poCode.trim() : undefined,
        productCode:
          productCode.trim().length > 0 ? productCode.trim() : undefined,
        productName:
          productName.trim().length > 0 ? productName.trim() : undefined,
        page: 1,
      }),
      replace: true,
    })
  }, 300)

  const handleClientChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        clientName: value === "all" ? undefined : value,
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        status: value === "all" ? undefined : (value as OutboundOrderStatus),
        page: 1,
      }),
    })
  }

  const handleMethodChange = (value: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        deliveryMethod:
          value === "all" ? undefined : (value as OutboundDeliveryMethod),
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
        fromDate: range.from,
        toDate: range.to,
        page: 1,
      }),
    })
  }

  const handleLimitChange = (value: string) => {
    const limit = Number(value) as 10 | 20 | 50
    void navigate({
      search: (prev) => ({
        ...prev,
        limit,
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
    setPoCode("")
    setProductCode("")
    setProductName("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          clientName: _clientName,
          poCode: _poCode,
          status: _status,
          deliveryMethod: _deliveryMethod,
          productCode: _productCode,
          productName: _productName,
          fromDate: _fromDate,
          toDate: _toDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
        {/* Top Header Bar: Title Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 pb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
          >
            <HelpCircle className="size-3.5 text-muted-foreground" />
            <span>Hướng dẫn</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            title="Tải lại dữ liệu"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5 text-muted-foreground" />
          </Button>

          <PendingAction
            label="Tạo DO mới"
            hint="Tính năng lập DO mới đang kết nối"
          >
            <Plus className="size-4" />
            Tạo DO mới
          </PendingAction>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Mã DO, Khách hàng, PO/Lý do, Trạng thái, Hình thức giao */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <FilterLabel label="Mã DO" htmlFor="do-q" />
              <div className="relative">
                <Input
                  id="do-q"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập mã DO"
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

            <div className="space-y-1.5">
              <FilterLabel label="Khách hàng" htmlFor="do-client" />
              <Select
                value={search.clientName ?? "all"}
                onValueChange={handleClientChange}
              >
                <SelectTrigger id="do-client" className="w-full text-xs">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <FilterLabel label="PO / Lý do" htmlFor="do-pocode" />
              <div className="relative">
                <Input
                  id="do-pocode"
                  className="pr-9 text-xs placeholder:text-muted-foreground/75"
                  placeholder="Nhập PO hoặc lý do"
                  value={poCode}
                  onChange={(e) => {
                    setPoCode(e.target.value)
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

            <div className="space-y-1.5">
              <FilterLabel label="Trạng thái" htmlFor="do-status" />
              <Select
                value={search.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="do-status" className="w-full text-xs">
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

            <div className="space-y-1.5">
              <FilterLabel label="Hình thức giao" htmlFor="do-method" />
              <Select
                value={search.deliveryMethod ?? "all"}
                onValueChange={handleMethodChange}
              >
                <SelectTrigger id="do-method" className="w-full text-xs">
                  <SelectValue placeholder="Chọn hình thức giao" />
                </SelectTrigger>
                <SelectContent>
                  {methodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Mã sản phẩm, Tên sản phẩm, Từ ngày - Đến ngày, Action buttons */}
          <div className="flex flex-col gap-3 pt-1 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <FilterLabel label="Mã sản phẩm" htmlFor="do-prodcode" />
                <div className="relative">
                  <Input
                    id="do-prodcode"
                    className="pr-9 text-xs placeholder:text-muted-foreground/75"
                    placeholder="Nhập mã sản phẩm"
                    value={productCode}
                    onChange={(e) => {
                      setProductCode(e.target.value)
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

              <div className="space-y-1.5">
                <FilterLabel label="Tên sản phẩm" htmlFor="do-prodname" />
                <div className="relative">
                  <Input
                    id="do-prodname"
                    className="pr-9 text-xs placeholder:text-muted-foreground/75"
                    placeholder="Nhập tên sản phẩm"
                    value={productName}
                    onChange={(e) => {
                      setProductName(e.target.value)
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

              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <FilterLabel
                  label="Từ ngày – Đến ngày"
                  htmlFor="do-daterange"
                />
                <DateRangePicker
                  id="do-daterange"
                  from={search.fromDate}
                  to={search.toDate}
                  onChange={handleDateRangeChange}
                />
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2 self-end lg:w-auto">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={resetFilters}
              >
                <RotateCw className="size-3.5" />
                Xóa bộ lọc
              </Button>
              <Button
                type="button"
                className="gap-1.5 text-xs"
                onClick={handleExecuteSearch}
              >
                <Search className="size-3.5" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>

        {/* Sub-toolbar right above table: Xuất Excel, In danh sách, Info count, Limit select */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-2">
          <div className="flex items-center gap-2">
            <PendingAction
              label="Xuất Excel"
              hint="Tính năng xuất Excel sắp có"
              variant="outline"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </PendingAction>

            <PendingAction
              label="In danh sách"
              hint="Tính năng in danh sách sắp có"
              variant="outline"
            >
              <Printer className="size-4 text-muted-foreground" />
              <span>In danh sách</span>
            </PendingAction>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="font-medium text-muted-foreground">
              Tổng số: <strong className="text-foreground">12 DO</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <Select
                value={String(search.limit ?? 20)}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {limitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
