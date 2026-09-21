import { Info } from "lucide-react"

import { productionOperationProgressStatusLabels } from "@/lib/types/production-job.type"
import type { ProductionOperationProgressStatus } from "@/lib/types/production-job.type"

// Đúng 3 dòng trong khung "GHI CHÚ" cuối mockup — mô tả ngưỡng đằng sau badge "Trạng thái" của
// ProductionExecutionJobsTable.tsx, không lặp lại nhãn suông.
const statusDescriptions: Record<ProductionOperationProgressStatus, string> = {
  IN_PROGRESS: "Đã thực hiện một phần nhưng chưa đủ định mức.",
  DONE: "Đã đủ số lượng theo định mức.",
  NOT_STARTED: "Chưa có báo cáo nào cho Part.",
}

const statusOrder: ProductionOperationProgressStatus[] = [
  "IN_PROGRESS",
  "DONE",
  "NOT_STARTED",
]

export function ProductionExecutionLegend() {
  return (
    <div className="space-y-2.5 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <Info className="size-4 text-primary" />
        <span>Ghi chú:</span>
      </div>
      <ul className="space-y-1.5 text-muted-foreground">
        {statusOrder.map((status) => (
          <li key={status}>
            •{" "}
            <strong className="font-medium text-foreground">
              Trạng thái {productionOperationProgressStatusLabels[status]}:
            </strong>{" "}
            {statusDescriptions[status]}
          </li>
        ))}
      </ul>
    </div>
  )
}
