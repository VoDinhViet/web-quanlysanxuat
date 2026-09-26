import { Info } from "lucide-react"

import { productionOperationProgressStatusLabels } from "@/lib/types/production-job.type"
import type { ProductionOperationProgressStatus } from "@/lib/types/production-job.type"

// Các dòng trong khung "GHI CHÚ" cuối mockup — mô tả ngưỡng đằng sau badge "Trạng thái" của
// ProductionExecutionJobsTable.tsx, không lặp lại nhãn suông.
const statusDescriptions: Record<ProductionOperationProgressStatus, string> = {
  OVERDUE: "Chưa hoàn thành và đã qua hạn hoàn thành của công đoạn.",
  IN_PROGRESS: "Job đang sản xuất, công đoạn chưa đủ định mức.",
  DONE: "Đã đủ số lượng theo định mức.",
  NOT_STARTED: "Chưa có báo cáo nào và Job chưa ở trạng thái đang sản xuất.",
}

const statusOrder: ProductionOperationProgressStatus[] = [
  "OVERDUE",
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
