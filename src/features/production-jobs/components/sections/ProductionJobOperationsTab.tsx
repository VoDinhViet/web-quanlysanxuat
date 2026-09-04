import { useMemo } from "react"
import { Route } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { TableQueryError } from "@/components/shared/primitives/TableQueryError"
import { TableQueryLoading } from "@/components/shared/primitives/TableQueryLoading"
import { ProductionJobOperationsLegend } from "@/features/production-jobs/components/composites/ProductionJobOperationsLegend"
import { ProductionJobOperationsTable } from "@/features/production-jobs/components/composites/ProductionJobOperationsTable"
import { productionJobOperationsQueryOptions } from "@/features/production-jobs/api/options"
import { outsourceableOperationsQueryOptions } from "@/features/outsourcing-orders/api"
import { ProductionJobStatus } from "@/lib/types/production-job.type"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"

// A rough row-count guess for the loading placeholder's height — the operations list isn't
// paginated, so there's no `search.limit` to size it off (unlike the paginated "BOM" tab).
const operationsRowEstimate = 5

// Trần cứng cho danh sách công đoạn OUTSOURCE của 1 Job — BE `PageOptionsDto` không có max, nhưng
// số công đoạn gia công ngoài của một Job thực tế xa dưới mức này.
const outsourceableOperationsLimit = 200

type ProductionJobOperationsTabProps = {
  productionJobId: string
  status: ProductionJobStatus
}

// Reads GET /production-jobs/:jobId/operations directly (client-driven, tab-gated) — the backend
// already groups by BOM item, one array element per BOM item with its own `operations[]`, so
// no client-side grouping is needed (see ProductionJobBomItem's doc comment). Tab chỉ đọc — nhập
// SL hoàn thành/không đạt đi qua dialog "Nhập báo cáo" dùng chung
// (JobOperationReportDialog.tsx, cũng dùng bởi màn "Thực hiện sản xuất"), tự khoá + hiện lý do
// khi Job chưa `IN_PROGRESS` thay vì tab tự ẩn control.
export function ProductionJobOperationsTab({
  productionJobId,
  status,
}: ProductionJobOperationsTabProps) {
  const operationsQuery = useQuery(
    productionJobOperationsQueryOptions(productionJobId)
  )
  const isInProgress = status === ProductionJobStatus.IN_PROGRESS
  const groups = operationsQuery.data ?? []

  // SL đã gửi/còn được phép gửi gia công ngoài không có trên GET .../operations (Production không
  // ghi/biết gì về OS-OUT, docs/domains/production.md) — ghép từ route popup OS-OUT đã có sẵn 2
  // số này. `enabled: isInProgress` vì BE route đó chỉ trả công đoạn của Job `IN_PROGRESS` — Job
  // đã COMPLETED/CANCELLED sẽ không thấy số đã gửi (giới hạn đã biết).
  const outsourceableQuery = useQuery({
    ...outsourceableOperationsQueryOptions({
      productionJobId,
      limit: outsourceableOperationsLimit,
    }),
    enabled: isInProgress,
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

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Route className="size-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold tracking-wide text-foreground">
            Công đoạn sản xuất
          </h2>
        </div>
      </div>

      {operationsQuery.isPending ? (
        <TableQueryLoading rows={operationsRowEstimate} />
      ) : operationsQuery.isError ? (
        <TableQueryError
          error={operationsQuery.error.message}
          onRetry={() => void operationsQuery.refetch()}
        />
      ) : (
        <ProductionJobOperationsTable
          groups={groups}
          jobStatus={status}
          outsourceableByOperationId={outsourceableByOperationId}
        />
      )}

      <div className="px-4 pb-4 sm:px-5">
        <ProductionJobOperationsLegend />
      </div>
    </div>
  )
}
