import { Info } from "lucide-react"

import {
  PRODUCTION_OPERATION_DUE_SOON_DAYS,
  productionOperationProgressStatusDescriptions,
  productionOperationProgressStatusLabels,
  productionOperationProgressStatusOrder,
} from "@/lib/types/production-job.type"

export function ProductionExecutionLegend() {
  return (
    <div className="space-y-2.5 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5">
      <div className="flex items-center gap-1.5 font-medium text-foreground">
        <Info className="size-4 text-primary" />
        <span>Ghi chú:</span>
      </div>
      <ul className="space-y-1.5 text-muted-foreground">
        {productionOperationProgressStatusOrder.map((status) => (
          <li key={status}>
            •{" "}
            <strong className="font-medium text-foreground">
              Trạng thái {productionOperationProgressStatusLabels[status]}:
            </strong>{" "}
            {productionOperationProgressStatusDescriptions[status]}
          </li>
        ))}
        <li>
          •{" "}
          <strong className="font-medium text-warning-ink">
            Hạn hoàn thành màu vàng:
          </strong>{" "}
          công đoạn chưa xong có hạn hoàn thành rơi vào hôm nay hoặc trong{" "}
          {PRODUCTION_OPERATION_DUE_SOON_DAYS} ngày tới.
        </li>
      </ul>
    </div>
  )
}
