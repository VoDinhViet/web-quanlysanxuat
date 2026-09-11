import { useMemo, useState } from "react"
import { useParams, useSearch } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { AltArrowLeft } from "@solar-icons/react"
import { History, Layers } from "lucide-react"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { OperationProgressBar } from "@/features/production-execution/components/primitives/OperationProgressBar"
import { ProductionExecutionPartsTable } from "@/features/production-execution/components/sections/ProductionExecutionPartsTable"
import { ProductionExecutionReportHistoryTable } from "@/features/production-execution/components/sections/ProductionExecutionReportHistoryTable"
import { jobOperationReportsQueryOptions } from "@/features/production-execution/api"
import {
  productionJobOperationsQueryOptions,
  productionJobQueryOptions,
} from "@/features/production-jobs/api"
import { OperationType } from "@/lib/types/operation.type"
import { productionJobStatusLabels } from "@/lib/types/production-job.type"
import type {
  JobOperationReportRow,
  ProductionJobBomItem,
} from "@/lib/types/production-job.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// BE đã lọc sẵn theo operationId (GET .../operations?operationId=...) — chỉ còn việc flatten mỗi
// BOM item's operations[] (nhóm theo Part phía BE) thành từng dòng "DANH SÁCH PART" riêng.
function buildProductionExecutionPartRows(
  bomItems: ProductionJobBomItem[]
): JobOperationReportRow[] {
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

  const [activeTab, setActiveTab] = useState<string>("parts")
  const [selectedBomItemId, setSelectedBomItemId] = useState<string | null>(null)

  const { data: job } = useSuspenseQuery(
    productionJobQueryOptions(productionJobId)
  )

  const operationsQuery = useQuery({
    ...productionJobOperationsQueryOptions(productionJobId, operationId),
    enabled: !!operationId,
  })

  const reportsQuery = useQuery({
    ...jobOperationReportsQueryOptions(productionJobId, operationId),
    enabled: !!productionJobId,
  })

  const partRows = useMemo(
    () =>
      operationsQuery.data
        ? buildProductionExecutionPartRows(operationsQuery.data)
        : [],
    [operationsQuery.data]
  )

  const firstOperation = partRows.at(0)?.operation
  const operationName = firstOperation?.name

  const partOptions = useMemo(() => {
    const seen = new Set<string>()
    const options: { id: string; code: string; name: string }[] = []
    for (const row of partRows) {
      if (!seen.has(row.bomItem.id)) {
        seen.add(row.bomItem.id)
        options.push({
          id: row.bomItem.id,
          code: row.bomItem.code,
          name: row.bomItem.name,
        })
      }
    }
    return options
  }, [partRows])

  const stats = useMemo(() => {
    let planned = 0
    let completed = 0
    let rejected = 0
    for (const row of partRows) {
      planned += row.operation.plannedQuantity
      completed += row.operation.completedQuantity
      rejected += row.operation.rejectedQuantity
    }
    const remaining = Math.max(0, planned - completed)
    const percent =
      planned > 0
        ? Math.min(100, Math.round((completed / planned) * 100))
        : 0
    return { planned, completed, rejected, remaining, percent }
  }, [partRows])

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
        {/* Job & Operation Overview Banner */}
        <Surface contentClassName="gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
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
              <span className="font-mono text-xl font-bold text-foreground">
                {job.code}
              </span>
              <Badge variant="outline" className="font-medium">
                {productionJobStatusLabels[job.status]}
              </Badge>
              {firstOperation && (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    firstOperation.type === OperationType.INHOUSE
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  )}
                >
                  <span
                    className={cn(
                      "mr-1.5 inline-block size-1.5 rounded-full",
                      firstOperation.type === OperationType.INHOUSE
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    )}
                  />
                  {firstOperation.type === OperationType.INHOUSE
                    ? "Trong xưởng"
                    : "Gia công ngoài"}
                </Badge>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 border-t border-border/60 pt-3.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Đơn hàng (PO):</dt>
              <dd className="font-mono font-semibold text-foreground">
                {job.order.code}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Khách hàng:</dt>
              <dd
                className="truncate font-semibold text-foreground"
                title={
                  job.client
                    ? `${job.client.name} (${job.client.code})`
                    : "—"
                }
              >
                {job.client
                  ? `${job.client.name} (${job.client.code})`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Sản phẩm (FG):</dt>
              <dd
                className="truncate font-semibold text-foreground"
                title={`${job.item.code} — ${job.item.name}`}
              >
                <span className="font-mono">{job.item.code}</span> —{" "}
                {job.item.name}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Số lượng Job:</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {quantityFormatter.format(job.quantity)} pcs
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">
                Công đoạn thực hiện:
              </dt>
              <dd className="truncate font-semibold text-foreground">
                {operationName ? (
                  <>
                    {firstOperation?.code && (
                      <span className="mr-1 font-mono text-muted-foreground">
                        [{firstOperation.code}]
                      </span>
                    )}
                    <span>{operationName}</span>
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Ngày bắt đầu:</dt>
              <dd className="font-medium text-foreground">
                {job.startedAt
                  ? DateTime.fromISO(job.startedAt).toFormat("dd/MM/yyyy")
                  : "Chưa bắt đầu"}
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="shrink-0 text-muted-foreground">Ngày tạo Job:</dt>
              <dd className="font-medium text-foreground">
                {DateTime.fromISO(job.createdAt).toFormat("dd/MM/yyyy")}
              </dd>
            </div>
          </dl>
        </Surface>

        {/* KPI / Operation Summary Cards */}
        {partRows.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground">
                Tổng Kế hoạch
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {quantityFormatter.format(stats.planned)}
                </span>
                <span className="text-xs text-muted-foreground">pcs</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground">
                Đã hoàn thành
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-success">
                  {quantityFormatter.format(stats.completed)}
                </span>
                <span className="text-xs text-muted-foreground">pcs</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground">
                Không đạt (NG)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-xl font-bold tabular-nums",
                    stats.rejected > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {quantityFormatter.format(stats.rejected)}
                </span>
                <span className="text-xs text-muted-foreground">pcs</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground">
                Còn lại
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold tabular-nums text-foreground">
                  {quantityFormatter.format(stats.remaining)}
                </span>
                <span className="text-xs text-muted-foreground">pcs</span>
              </div>
            </div>

            <div className="col-span-2 rounded-lg border border-border/60 bg-card p-3.5 shadow-xs sm:col-span-2 lg:col-span-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Tiến độ công đoạn
              </span>
              <div className="mt-2">
                <OperationProgressBar
                  plannedQuantity={stats.planned}
                  completedQuantity={stats.completed}
                  showCount={false}
                  size="lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs: Part List & Report History */}
        <Surface contentClassName="gap-4 p-4 sm:p-5">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="gap-4"
          >
            <div className="border-b border-border/60 pb-1">
              <TabsList variant="line" className="gap-2">
                <TabsTrigger
                  value="parts"
                  className="gap-2 px-3 py-1.5 text-xs font-semibold data-selected:bg-muted/40"
                >
                  <Layers className="size-3.5" />
                  Danh sách Part
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px]"
                  >
                    {partRows.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="gap-2 px-3 py-1.5 text-xs font-semibold data-selected:bg-muted/40"
                >
                  <History className="size-3.5" />
                  Lịch sử báo cáo
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-1.5 text-[10px]"
                  >
                    {reportsQuery.data?.length ?? 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="parts" className="m-0 outline-none">
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
                  jobStatus={job.status}
                />
              )}
            </TabsContent>

            <TabsContent value="reports" className="m-0 outline-none">
              <ProductionExecutionReportHistoryTable
                reports={reportsQuery.data ?? []}
                isPending={reportsQuery.isPending}
                isError={reportsQuery.isError}
                error={reportsQuery.error?.message}
                onRetry={() => void reportsQuery.refetch()}
                partOptions={partOptions}
                selectedBomItemId={selectedBomItemId}
                onSelectBomItemId={setSelectedBomItemId}
              />
            </TabsContent>
          </Tabs>
        </Surface>
      </div>
    </main>
  )
}
