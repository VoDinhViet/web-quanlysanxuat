import { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { useDebounceCallback } from "usehooks-ts"
import { Download, RotateCw, Search } from "lucide-react"
import { toast } from "sonner"

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
import { DateRangePicker } from "@/components/shared/composites/DateRangePicker"
import { exportPurchaseLedger } from "@/features/purchase-ledger/api/server-functions/export-purchase-ledger.api"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"
import { purchaseLedgerStatusLabels } from "@/lib/types/purchase-ledger.type"
import { buildOptionsFromLabels } from "@/lib/utils"
import type { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"

const statusFilterOptions = [
  { value: "all", label: "Tất cả" },
  ...buildOptionsFromLabels(purchaseLedgerStatusLabels),
]

export function PurchaseLedgerTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/purchase-ledger/" })
  const navigate = useNavigate({ from: "/manage/purchase-ledger/" })
  const [q, setQ] = useState(search.q ?? "")

  const exportPurchaseLedgerFn = useServerFn(exportPurchaseLedger)
  const exportMutation = useMutation({
    mutationFn: () => exportPurchaseLedgerFn({ data: search }),
    onSuccess: ({ base64, filename }) => {
      downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      toast.success("Đã xuất file Excel")
    },
    onError: (error) => toast.error(error.message),
  })

  // Filters as the user types, 300ms after the last keystroke — same idiom as
  // PurchaseRequestsTableFilter.tsx.
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

  const handleStatusChange = (value: string) => {
    const status = value === "all" ? undefined : (value as PurchaseLedgerStatus)
    void navigate({ search: (prev) => ({ ...prev, status, page: 1 }) })
  }

  const handleCreatedDateRangeChange = (
    createdStartDate: string | undefined,
    createdEndDate: string | undefined
  ) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        createdStartDate,
        createdEndDate,
        page: 1,
      }),
    })
  }

  const handleNeededDateRangeChange = (
    neededStartDate: string | undefined,
    neededEndDate: string | undefined
  ) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        neededStartDate,
        neededEndDate,
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
    // Cancel first: a debounced call still in flight would re-apply the term the user just
    // cleared, ~300ms after the box goes blank.
    handleSearch.cancel()
    setQ("")
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          status: _status,
          createdStartDate: _createdStartDate,
          createdEndDate: _createdEndDate,
          neededStartDate: _neededStartDate,
          neededEndDate: _neededEndDate,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(9rem,1fr)_minmax(14rem,1.3fr)_minmax(14rem,1.3fr)_minmax(14rem,1.4fr)]">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="purchase-ledger-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              items={statusFilterOptions}
              value={search.status ?? "all"}
              onValueChange={(value) =>
                value !== null && handleStatusChange(value)
              }
            >
              <SelectTrigger
                id="purchase-ledger-status"
                className="w-full text-xs"
              >
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

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-ledger-created-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày tạo PR
            </Label>
            <DateRangePicker
              id="purchase-ledger-created-range"
              from={search.createdStartDate}
              to={search.createdEndDate}
              onChange={handleCreatedDateRangeChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="purchase-ledger-needed-range"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Ngày cần
            </Label>
            <DateRangePicker
              id="purchase-ledger-needed-range"
              from={search.neededStartDate}
              to={search.neededEndDate}
              onChange={handleNeededDateRangeChange}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 xl:col-span-1">
            <Label
              htmlFor="purchase-ledger-search"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Tìm kiếm
            </Label>
            <div className="relative">
              <Input
                id="purchase-ledger-search"
                className="pr-9 text-xs placeholder:text-muted-foreground/75"
                placeholder="Tìm theo Mã PR, mã/tên vật tư..."
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  handleSearch(event.target.value)
                }}
              />
              <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
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
            Làm mới
          </Button>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            <Download className="size-4" />
            {exportMutation.isPending ? "Đang xuất..." : "Xuất Excel"}
          </Button>
        </div>
      </div>
    </div>
  )
}
