import { useCallback, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { ProductionJobsSelectionBar } from "@/features/production-jobs/components/composites/ProductionJobsSelectionBar"
import { ProductionJobsTable } from "@/features/production-jobs/components/sections/ProductionJobsTable"
import { ProductionJobsTableFilter } from "@/features/production-jobs/components/sections/ProductionJobsTableFilter"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"
import { exportProductionJobsPlanPdf } from "@/features/production-jobs/api/server-functions/export-production-jobs-plan-pdf.api"
import { downloadBase64File, PDF_MIME_TYPE } from "@/lib/download-file"
import type { ProductionJob } from "@/lib/types/production-job.type"

type SelectedJobClient = { id: string; name: string }

export function ProductionJobsPage() {
  // useSearch keys off the file-based route id. The loader prefetched this
  // query; it's a plain useQuery so filter/pagination changes only update the
  // table, not the whole route. The filter reads/writes this same route
  // search itself (its own useSearch/useNavigate) and fetches its own
  // reference options, rather than through props.
  const search = useSearch({ from: "/(authed)/manage_/production-jobs/" })

  const productionJobsQuery = useQuery({
    ...productionJobsQueryOptions(search),
    placeholderData: keepPreviousData,
  })

  // Biểu mẫu kế hoạch thuộc về đúng một khách hàng: tích Job đầu tiên sẽ khoá khách hàng, các
  // Job của khách hàng khác bị vô hiệu cho tới khi bỏ chọn hết. Lưu jobId → khách hàng để lựa
  // chọn giữ được qua các trang.
  const [selection, setSelection] = useState<Map<string, SelectedJobClient>>(
    () => new Map()
  )
  const selectedJobIds = new Set(selection.keys())
  const selectedClient = selection.values().next().value
  const selectedClientId = selectedClient?.id
  const pageJobs = productionJobsQuery.data?.data

  const handleClearSelection = useCallback(() => {
    setSelection(new Map())
  }, [])

  const handleToggleJob = useCallback((job: ProductionJob) => {
    setSelection((prev) => {
      const next = new Map(prev)
      if (next.has(job.id)) {
        next.delete(job.id)
      } else if (job.client !== null) {
        next.set(job.id, { id: job.client.id, name: job.client.name })
      }
      return next
    })
  }, [])

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      setSelection((prev) => {
        const next = new Map(prev)
        const targetClientId =
          prev.values().next().value?.id ??
          pageJobs?.find((job) => job.client !== null)?.client?.id
        for (const job of pageJobs ?? []) {
          if (job.client === null || job.client.id !== targetClientId) continue
          if (checked) {
            next.set(job.id, { id: job.client.id, name: job.client.name })
          } else {
            next.delete(job.id)
          }
        }
        return next
      })
    },
    [pageJobs]
  )

  const exportPlanPdfFn = useServerFn(exportProductionJobsPlanPdf)

  const { mutateAsync: exportPlanPdf, isPending: isExportingPlan } =
    useMutation({
      mutationFn: () =>
        exportPlanPdfFn({ data: { jobIds: Array.from(selectedJobIds) } }),
    })

  const handleExportPlan = () => {
    toast.promise(
      exportPlanPdf().then(({ base64, filename }) => {
        downloadBase64File(base64, filename, PDF_MIME_TYPE)
      }),
      {
        loading: "Đang tạo biểu mẫu kế hoạch sản xuất...",
        success: "Đã xuất biểu mẫu kế hoạch sản xuất",
        error: (error) => error.message || "Xuất file thất bại",
      }
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
      <Surface contentClassName="min-h-[calc(100svh-13rem)]">
        <ProductionJobsTableFilter
          selectedJobCount={selectedJobIds.size}
          isExportingPlan={isExportingPlan}
          onExportPlan={handleExportPlan}
        />

        {selectedClient !== undefined && (
          <ProductionJobsSelectionBar
            selectedCount={selectedJobIds.size}
            clientName={selectedClient.name}
            onClearSelection={handleClearSelection}
          />
        )}

        {productionJobsQuery.isPending ? (
          <TableQueryLoading rows={search.limit} />
        ) : productionJobsQuery.isError ? (
          <TableQueryError
            error={productionJobsQuery.error.message}
            onRetry={() => void productionJobsQuery.refetch()}
          />
        ) : (
          <ProductionJobsTable
            rows={productionJobsQuery.data.data}
            pagination={productionJobsQuery.data.pagination}
            isPending={productionJobsQuery.isFetching}
            selectedJobIds={selectedJobIds}
            selectedClientId={selectedClientId}
            onToggleJob={handleToggleJob}
            onToggleAll={handleToggleAll}
          />
        )}
      </Surface>
    </div>
  )
}
