import { Info, Lightbulb } from "lucide-react"

import { StatusLegend } from "@/components/shared/composites/StatusLegend"
import {
  InventoryRequisitionStatus,
  inventoryRequisitionStatusDescriptions,
} from "@/lib/types/inventory-requisition.type"
import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionBadges"

const statuses = Object.values(InventoryRequisitionStatus)

export function InventoryRequisitionsLegend() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-card p-4 text-xs shadow-card sm:p-5 lg:grid-cols-2">
      <StatusLegend
        icon={Info}
        title="Ghi chú trạng thái:"
        items={statuses.map((status) => ({
          key: status,
          badge: (
            <InventoryRequisitionStatusBadge
              status={status}
              className="mt-0.5 shrink-0 text-[10px]"
            />
          ),
          description: inventoryRequisitionStatusDescriptions[status],
        }))}
      />

      {/* Tips */}
      <div className="space-y-2.5 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Lightbulb className="size-4 text-amber-500" />
          <span>Tips:</span>
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <p>
            • Phiếu chờ người có thẩm quyền duyệt sẽ hiện ở trạng thái{" "}
            <strong className="font-medium text-foreground">Chờ duyệt</strong>.
          </p>
          <p>
            • Chỉ phiếu{" "}
            <strong className="font-medium text-foreground">Nháp</strong> hoặc{" "}
            <strong className="font-medium text-foreground">Từ chối</strong> mới
            có thể chỉnh sửa hoặc xóa.
          </p>
        </div>
      </div>
    </div>
  )
}
