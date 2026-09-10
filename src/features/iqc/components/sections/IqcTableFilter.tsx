import { useMemo } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { Download, Plus, RotateCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { PendingAction } from "@/components/shared/primitives/PendingAction"
import { exportIqc } from "@/features/iqc/api/server-functions/export-iqc.api"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { downloadBase64File, XLSX_MIME_TYPE } from "@/lib/download-file"
import type { IqcResult, IqcStatus } from "@/lib/types/iqc.type"
import { iqcResultLabels, iqcStatusLabels } from "@/lib/types/iqc.type"
import type { SelectOption } from "@/lib/utils"

export function IqcTableFilter() {
  const search = useSearch({ from: "/(authed)/manage_/iqc/" })
  const navigate = useNavigate({ from: "/manage/iqc/" })

  // The route loader already prefetches this — resolves synchronously off cache.
  const { data: supplierOptions } = useSuspenseQuery(
    supplierOptionsQueryOptions()
  )

  const iqcResultFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "Tất cả" },
      ...Object.entries(iqcResultLabels).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    []
  )

  const iqcStatusFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "Tất cả" },
      ...Object.entries(iqcStatusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    []
  )

  const supplierFilterOptions = useMemo<SelectOption[]>(
    () => [
      { value: "all", label: "Tất cả" },
      ...supplierOptions.map((option) => ({
        value: option.id,
        label: option.name,
      })),
    ],
    [supplierOptions]
  )

  const exportIqcFn = useServerFn(exportIqc)
  const exportMutation = useMutation({
    mutationFn: () => exportIqcFn({ data: search }),
    onSuccess: ({ base64, filename }) => {
      downloadBase64File(base64, filename, XLSX_MIME_TYPE)
      toast.success("Đã xuất file Excel")
    },
    onError: (error) => toast.error(error.message),
  })

  const handleResultChange = (value: string | null) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        result: !value || value === "all" ? undefined : (value as IqcResult),
        page: 1,
      }),
    })
  }

  const handleStatusChange = (value: string | null) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        status: !value || value === "all" ? undefined : (value as IqcStatus),
        page: 1,
      }),
    })
  }

  const handleSupplierChange = (value: string | null) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        supplierId: !value || value === "all" ? undefined : value,
        page: 1,
      }),
    })
  }

  const resetFilters = () => {
    void navigate({
      search: (prev) => {
        const {
          q: _q,
          supplierId: _supplierId,
          result: _result,
          status: _status,
          ...rest
        } = prev
        return { ...rest, page: 1 }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 bg-card px-4 py-4 lg:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 items-end gap-3 sm:grid-cols-3 xl:grid-cols-[minmax(14rem,1.4fr)_minmax(11rem,1fr)_minmax(11rem,1fr)]">
          {/* Nhà cung cấp */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="iqc-supplier"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Nhà cung cấp
            </Label>
            <Select
              items={supplierFilterOptions}
              value={search.supplierId ?? "all"}
              onValueChange={handleSupplierChange}
            >
              <SelectTrigger id="iqc-supplier" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supplierFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kết quả QC */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="iqc-result"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Kết quả QC
            </Label>
            <Select
              items={iqcResultFilterOptions}
              value={search.result ?? "all"}
              onValueChange={handleResultChange}
            >
              <SelectTrigger id="iqc-result" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iqcResultFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="iqc-status"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Trạng thái
            </Label>
            <Select
              items={iqcStatusFilterOptions}
              value={search.status ?? "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="iqc-status" className="w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iqcStatusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
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
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            <Download className="size-4" />
            {exportMutation.isPending ? "Đang xuất..." : "Xuất Excel"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="text-xs"
            onClick={resetFilters}
          >
            <RotateCw className="size-3.5" />
            Xóa bộ lọc
          </Button>

          <PendingAction
            label="Thêm IQC"
            hint="Tính năng tạo phiếu IQC sắp có"
            variant="default"
          >
            <Plus className="size-4" />
            Thêm IQC
          </PendingAction>
        </div>
      </div>
    </div>
  )
}
