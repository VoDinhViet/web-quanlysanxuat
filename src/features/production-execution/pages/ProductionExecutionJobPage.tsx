import { useMemo } from "react"
import { Link, useParams, useSearch } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { AltArrowLeft } from "@solar-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

// Job chưa `start`, hoặc đã start nhưng chưa qua "Duyệt công đoạn" — 2 điều kiện BE chặn PATCH
// .../operations/:operationId (E087/E250), cùng logic canEdit của
// ProductionJobOperationsTab.tsx (màn "Quản lý sản xuất"). Job đã rời IN_PROGRESS (WAITING_QC trở
// đi) nghĩa là mọi công đoạn Cấp 0 đã xong — không còn gì để báo cáo thêm.
function resolveReportDisabledReason(
  status: ProductionJobStatus,
  operationsApprovedAt: string | null
): string | null {
  if (status === ProductionJobStatus.PENDING) {
    return 'Job chưa bắt đầu sản xuất — bấm "Xác nhận" ở trang Quản lý sản xuất trước.'
  }
  if (status !== ProductionJobStatus.IN_PROGRESS) {
    return "Job đã hoàn thành mọi công đoạn — không thể báo cáo thêm."
  }
  if (operationsApprovedAt === null) {
    return 'Công đoạn của Job này chưa được duyệt — bấm "Duyệt công đoạn" ở trang Quản lý sản xuất trước.'
  }
  return null
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
  const operationsQuery = useQuery(
    productionJobOperationsQueryOptions(productionJobId)
  )

  // Lọc đúng công đoạn đang chọn khỏi mọi công đoạn của mỗi Part (BE trả cả, chưa lọc — C1 trong
  // kế hoạch).
  const partRows: ProductionExecutionPartRow[] = useMemo(() => {
    if (!operationId || !operationsQuery.data) return []

    return operationsQuery.data.flatMap((bomItem) => {
      const operation = bomItem.operations.find(
        (item) => item.operationId === operationId
      )
      return operation ? [{ bomItem, operation }] : []
    })
  }, [operationsQuery.data, operationId])

  const operationName = partRows.at(0)?.operation.name

  const disabledReason = resolveReportDisabledReason(
    job.status,
    job.operationsApprovedAt
  )

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
            <Button
              variant="ghost"
              className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Quay lại danh sách công việc"
              asChild
            >
              <Link
                to="/manage/production-execution"
                search={{ page: 1, limit: 10, operationId }}
              >
                <AltArrowLeft className="size-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Link>
            </Button>
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
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/manage/production-execution"
                  search={{ page: 1, limit: 10 }}
                >
                  Quay lại danh sách Thực hiện sản xuất
                </Link>
              </Button>
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
