import { useMemo, useState } from "react"
import { Navigate, useParams, useSearch } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { History, Layers, Magnifer } from "@solar-icons/react"
import { DateTime } from "luxon"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { ProductionExecutionJobHeader } from "@/features/production-execution/components/layouts/ProductionExecutionJobHeader"
import { ProductionExecutionPartsTable } from "@/features/production-execution/components/sections/ProductionExecutionPartsTable"
import { ProductionExecutionOperationsLegend } from "@/features/production-execution/components/sections/ProductionExecutionOperationsLegend"
import { ProductionExecutionReportHistoryTable } from "@/features/production-execution/components/sections/ProductionExecutionReportHistoryTable"
import type { PageSize } from "@/components/shared/composites/Pagination"
import {
  jobOperationReportsQueryOptions,
  productionExecutionJobOperationsQueryOptions,
  productionExecutionJobQueryOptions,
} from "@/features/production-execution/api"
import {
  buildPartRows,
  isAllPartsCompleted,
  resolveLatestDueDate,
} from "@/features/production-execution/constants/production-execution-parts"
import { outsourceableOperationsQueryOptions } from "@/features/outsourcing-orders/api"
import { useHasPermission } from "@/hooks/use-permissions"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"

const tabTriggerClassName =
  "h-12 flex-none gap-2 rounded-none px-4 text-sm font-medium text-muted-foreground transition-colors after:bg-primary group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 hover:bg-muted/40 hover:text-foreground data-selected:bg-primary/5 data-selected:text-primary group-data-[variant=line]/tabs-list:data-selected:bg-primary/5 data-selected:hover:bg-primary/5"

export function ProductionExecutionJobPage() {
  const { productionJobId } = useParams({
    from: "/(authed)/manage_/production-execution_/$productionJobId",
  })
  const { operationId } = useSearch({
    from: "/(authed)/manage_/production-execution_/$productionJobId",
  })

  // Mọi dữ liệu của trang phụ thuộc công đoạn đang chọn — thiếu thì quay về màn chọn công đoạn.
  if (!operationId) {
    return (
      <Navigate
        to="/manage/production-execution"
        search={{ page: 1, limit: 10 }}
        replace
      />
    )
  }

  return (
    <ProductionExecutionJobContent
      productionJobId={productionJobId}
      operationId={operationId}
    />
  )
}

type ProductionExecutionJobContentProps = {
  productionJobId: string
  operationId: string
}

function ProductionExecutionJobContent({
  productionJobId,
  operationId,
}: ProductionExecutionJobContentProps) {
  const [activeTab, setActiveTab] = useState<string>("parts")
  const [partSearch, setPartSearch] = useState("")
  const [selectedBomItemId, setSelectedBomItemId] = useState<string | null>(
    null
  )
  const [reportPage, setReportPage] = useState(1)
  const [reportPageSize, setReportPageSize] = useState<PageSize>(10)

  // Header Job kèm ảnh sản phẩm tổng — BE kiểm công đoạn đang chọn nằm trong phạm vi được phân công.
  const { data: job } = useSuspenseQuery(
    productionExecutionJobQueryOptions(productionJobId, operationId)
  )

  // BE lọc sẵn theo công đoạn đang chọn (`operationId` trên URL), mỗi Part kèm công đoạn kế tiếp.
  const operationsQuery = useQuery(
    productionExecutionJobOperationsQueryOptions(productionJobId, operationId)
  )

  const groups = useMemo(
    () => operationsQuery.data ?? [],
    [operationsQuery.data]
  )

  // Thông tin số lượng đã gửi cho công đoạn gia công ngoài — cần quyền xem gia công ngoài.
  const canReadOutsourcing = useHasPermission("outsourcing:read")
  const outsourceableQuery = useQuery({
    ...outsourceableOperationsQueryOptions({
      productionJobId,
      operationId,
      limit: 200,
    }),
    enabled:
      job.status === ProductionJobStatus.IN_PROGRESS && canReadOutsourcing,
  })

  const outsourceableByOperationId = useMemo(
    () =>
      new Map<string, OutsourceableOperation>(
        (outsourceableQuery.data?.data ?? []).map((row) => [
          row.productionJobOperationId,
          row,
        ])
      ),
    [outsourceableQuery.data]
  )

  // Lịch sử các lần báo cáo hoàn thành
  const reportsQuery = useQuery(
    jobOperationReportsQueryOptions({
      productionJobId,
      operationId,
      bomItemId: selectedBomItemId ?? undefined,
      page: reportPage,
      limit: reportPageSize,
    })
  )

  const partRows = useMemo(() => buildPartRows(groups), [groups])

  const searchTerm = partSearch.trim().toLowerCase()
  const visiblePartRows = useMemo(() => {
    const term = searchTerm
    if (term.length === 0) return partRows

    return partRows.filter(
      ({ bomItem }) =>
        bomItem.code.toLowerCase().includes(term) ||
        bomItem.name.toLowerCase().includes(term)
    )
  }, [partRows, searchTerm])

  const latestDueDate = resolveLatestDueDate(partRows)
  const isDueDateOverdue =
    latestDueDate !== null &&
    !isAllPartsCompleted(partRows) &&
    latestDueDate <
      DateTime.now().setZone("Asia/Ho_Chi_Minh").toFormat("yyyy-MM-dd")

  const partOptions = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        code: group.code,
        name: group.name,
      })),
    [groups]
  )

  const image =
    job.image ?? groups.find((group) => group.itemType === "FG")?.image ?? null

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
        <Surface>
          <ProductionExecutionJobHeader
            job={job}
            image={image}
            revision={job.item.revision}
            operationId={operationId}
            dueDate={latestDueDate}
            isDueDateOverdue={isDueDateOverdue}
          />
        </Surface>

        <Surface>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="gap-0"
          >
            <div className="border-b border-border">
              <TabsList
                variant="line"
                className="w-full justify-start gap-1 rounded-none p-0 group-data-horizontal/tabs:h-auto"
              >
                <TabsTrigger value="parts" className={tabTriggerClassName}>
                  <Layers className="size-3.5" />
                  Chi tiết sản phẩm
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {partRows.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="reports" className={tabTriggerClassName}>
                  <History className="size-3.5" />
                  Lịch sử báo cáo
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {reportsQuery.data?.pagination.totalRecords ?? 0}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="parts"
              className="m-0 space-y-4 p-4 outline-none sm:p-5"
            >
              <div className="relative w-full sm:w-72">
                <Input
                  aria-label="Tìm theo mã sản phẩm, tên sản phẩm"
                  className="pl-9 text-xs"
                  placeholder="Tìm theo mã sản phẩm, tên sản phẩm..."
                  value={partSearch}
                  onChange={(event) => setPartSearch(event.target.value)}
                />
                <Magnifer className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {operationsQuery.isPending ? (
                <TableQueryLoading rows={5} />
              ) : operationsQuery.isError ? (
                <TableQueryError
                  error={operationsQuery.error.message}
                  onRetry={() => void operationsQuery.refetch()}
                />
              ) : (
                <>
                  <ProductionExecutionPartsTable
                    productionJobId={productionJobId}
                    rows={visiblePartRows}
                    jobStatus={job.status}
                    outsourceableByOperationId={outsourceableByOperationId}
                    hasSearchTerm={searchTerm.length > 0}
                  />
                  <ProductionExecutionOperationsLegend />
                </>
              )}
            </TabsContent>

            <TabsContent
              value="reports"
              className="m-0 p-4 outline-none sm:p-5"
            >
              <ProductionExecutionReportHistoryTable
                reports={reportsQuery.data?.data ?? []}
                pagination={reportsQuery.data?.pagination}
                onPageChange={setReportPage}
                onPageSizeChange={(size) => {
                  setReportPageSize(size)
                  setReportPage(1)
                }}
                isPending={reportsQuery.isPending}
                isError={reportsQuery.isError}
                error={reportsQuery.error?.message}
                onRetry={() => void reportsQuery.refetch()}
                partOptions={partOptions}
                selectedBomItemId={selectedBomItemId}
                onSelectBomItemId={(bomItemId) => {
                  setSelectedBomItemId(bomItemId)
                  setReportPage(1)
                }}
              />
            </TabsContent>
          </Tabs>
        </Surface>
      </div>
    </main>
  )
}
