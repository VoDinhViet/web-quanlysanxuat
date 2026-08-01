import { Route } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"
import { TableQueryError } from "@/components/shared/TableQueryError"
import { TableQueryLoading } from "@/components/shared/TableQueryLoading"
import { ProductionJobOperationsSidebar } from "@/features/production-jobs/components/detail/ProductionJobOperationsSidebar"
import { ProductionJobOperationsTable } from "@/features/production-jobs/components/detail/ProductionJobOperationsTable"
import { productionJobStepsQueryOptions } from "@/features/production-jobs/api/production-jobs.options"

// A rough row-count guess for the loading placeholder's height — steps aren't paginated, so
// there's no `search.limit` to size it off (unlike the paginated tables elsewhere in the app).
const STEPS_ROW_ESTIMATE = 5

type ProductionJobOperationsTabProps = {
  productionJobId: string
}

// Reads GET /production-jobs/:jobId/steps directly (client-driven, tab-gated). The old mock UI's
// Part-grouped, inhouse/outsource progress table has no backing data at all on this endpoint —
// production_job_steps only stores the operation + note + sortOrder, no part concept and no
// planned/done/sent/received quantities (see production-job.type.ts) — so this tab shows the real
// flat step list plus one alert explaining what's missing, instead of an empty grouped shell that
// no longer matches the data model.
export function ProductionJobOperationsTab({
  productionJobId,
}: ProductionJobOperationsTabProps) {
  const stepsQuery = useQuery(productionJobStepsQueryOptions(productionJobId))

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-md border border-border/60 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <h2 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
              <Route className="size-3.5 text-muted-foreground" />
              Công đoạn sản xuất
            </h2>
          </div>

          {stepsQuery.isPending ? (
            <TableQueryLoading rows={STEPS_ROW_ESTIMATE} />
          ) : stepsQuery.isError ? (
            <TableQueryError
              error={stepsQuery.error.message}
              onRetry={() => void stepsQuery.refetch()}
            />
          ) : (
            <ProductionJobOperationsTable steps={stepsQuery.data} />
          )}
        </div>

        <MissingSectionAlert>
          Chưa có API theo dõi SL kế hoạch/đã làm/gửi gia công/nhận gia công
          theo từng Part — <code>production_job_steps</code> chỉ lưu công đoạn
          (tên, loại, ghi chú), không lưu part hay số lượng.
        </MissingSectionAlert>
      </div>

      <ProductionJobOperationsSidebar />
    </div>
  )
}
