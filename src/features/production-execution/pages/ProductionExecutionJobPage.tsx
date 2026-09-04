import { useMemo } from "react"
import { useParams, useSearch } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { AltArrowLeft } from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/button"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { ProductionExecutionPartsTable } from "@/features/production-execution/components/sections/ProductionExecutionPartsTable"
import {
  productionJobOperationsQueryOptions,
  productionJobQueryOptions,
} from "@/features/production-jobs/api"
import {
  ProductionJobStatus,
  productionJobStatusLabels,
} from "@/lib/types/production-job.type"
import type { ProductionExecutionPartRow } from "@/features/production-execution/components/composites/ProductionExecutionPartsTableColumns"
import type { ProductionJobBomItem } from "@/lib/types/production-job.type"

// Job chưa `start` — chặn PATCH .../operations/:operationId (E087), cùng logic canEdit của
// ProductionJobOperationsTab.tsx (màn "Quản lý sản xuất"). Job đã rời IN_PROGRESS (WAITING_QC trở
// đi) nghĩa là mọi công đoạn Cấp 0 đã xong — không còn gì để báo cáo thêm. Backend's separate
// "Duyệt công đoạn" gate was removed 2026-09-03 — "Xác nhận" alone is the only condition now.
function resolveReportDisabledReason(
  status: ProductionJobStatus
): string | null {
  if (status === ProductionJobStatus.PENDING) {
    return 'Job chưa bắt đầu sản xuất — bấm "Xác nhận" ở trang Quản lý sản xuất trước.'
  }
  if (status !== ProductionJobStatus.IN_PROGRESS) {
    return "Job đã hoàn thành mọi công đoạn — không thể báo cáo thêm."
  }
  return null
}

// BE đã lọc sẵn theo operationId (GET .../operations?operationId=...) — chỉ còn việc flatten mỗi
// BOM item's operations[] (nhóm theo Part phía BE) thành từng dòng "DANH SÁCH PART" riêng.
function buildProductionExecutionPartRows(
  bomItems: ProductionJobBomItem[]
): ProductionExecutionPartRow[] {
  return bomItems.flatMap((bomItem) =>
    bomItem.operations.map((operation) => ({ bomItem, operation }))
  )
}

export function ProductionExecutionJobPage() {
  const { productionJobId } = useParams({
    from: "/(authed)/manage_/production-execution_/$productionJobId",
  })
  const { operationId } = useSearch({
    from: "/(authed)/manage_/production-execution_/$productionJobId",
  })

  const { data: job } = useSuspenseQuery(
    productionJobQueryOptions(productionJobId)
  )
  const operationsQuery = useQuery({
    ...productionJobOperationsQueryOptions(productionJobId, operationId),
    enabled: !!operationId,
  })

  const partRows = useMemo(
    () =>
      operationsQuery.data
        ? buildProductionExecutionPartRows(operationsQuery.data)
        : [],
    [operationsQuery.data]
  )

  const operationName = partRows.at(0)?.operation.name

  const disabledReason = resolveReportDisabledReason(job.status)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Thực hiện sản xuất"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Thực hiện sản xuất", href: "/manage/production-execution" },
          { label: job.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <Surface contentClassName="gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton
              to="/manage/production-execution"
              search={{ page: 1, limit: 10, operationId }}
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại danh sách công việc"
            >
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </LinkButton>
            <span className="font-mono text-lg font-bold text-foreground">
              {job.code}
            </span>
            <Badge variant="outline">
              {productionJobStatusLabels[job.status]}
            </Badge>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">PO:</dt>
              <dd className="font-mono font-semibold text-foreground">
                {job.order.code}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5 sm:col-span-2 lg:col-span-1">
              <dt className="shrink-0 text-muted-foreground">Sản phẩm:</dt>
              <dd className="truncate font-semibold text-foreground">
                {job.item.code} — {job.item.name}
              </dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Số lượng Job:</dt>
              <dd className="font-semibold text-foreground">
                {job.quantity} pcs
              </dd>
            </div>
            {operationName && (
              <div className="flex items-baseline gap-1.5">
                <dt className="text-muted-foreground">Công đoạn:</dt>
                <dd className="font-semibold text-foreground">
                  {operationName}
                </dd>
              </div>
            )}
          </dl>
        </Surface>

        <Surface contentClassName="gap-4 p-4 sm:p-5">
          <h2 className="text-xs font-semibold tracking-wide text-foreground">
            Danh sách Part
          </h2>

          {!operationId ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
              <p>Thiếu thông tin công đoạn.</p>
              <LinkButton
                to="/manage/production-execution"
                search={{ page: 1, limit: 10 }}
                variant="outline"
                size="sm"
              >
                Quay lại danh sách Thực hiện sản xuất
              </LinkButton>
            </div>
          ) : operationsQuery.isPending ? (
            <TableQueryLoading rows={4} />
          ) : operationsQuery.isError ? (
            <TableQueryError
              error={operationsQuery.error.message}
              onRetry={() => void operationsQuery.refetch()}
            />
          ) : (
            <ProductionExecutionPartsTable
              rows={partRows}
              disabledReason={disabledReason}
            />
          )}
        </Surface>
      </div>
    </main>
  )
}
