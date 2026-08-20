import { Info, Lightbulb } from "lucide-react"

import {
  InventoryIssueStatus,
  inventoryIssueStatusDescriptions,
} from "@/lib/types/inventory-issue.type"
import { InventoryIssueStatusBadge } from "@/features/inventory-issues/components/InventoryIssueBadges"

const statuses = Object.values(InventoryIssueStatus)

export function InventoryIssuesLegend() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5 lg:grid-cols-2">
      {/* Ghi chú trạng thái */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Info className="size-4 text-primary" />
          <span>Ghi chú trạng thái:</span>
        </div>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {statuses.map((status) => (
            <li key={status} className="flex items-start gap-2">
              <InventoryIssueStatusBadge
                status={status}
                className="mt-0.5 shrink-0 text-[10px]"
              />
              <span className="text-muted-foreground">
                {inventoryIssueStatusDescriptions[status]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      <div className="space-y-2.5 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Lightbulb className="size-4 text-amber-500" />
          <span>Tips:</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p>
            • Chỉ phiếu ở trạng thái{" "}
            <strong className="font-medium text-foreground">Nháp</strong> mới có
            thể chỉnh sửa hoặc xóa.
          </p>
          <p>
            • Phiếu ở trạng thái{" "}
            <strong className="font-medium text-foreground">Đã xuất kho</strong>{" "}
            đã trừ tồn kho và không thể sửa đổi.
          </p>
        </div>
      </div>
    </div>
  )
}
