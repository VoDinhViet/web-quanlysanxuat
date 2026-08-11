import { PackageSearch } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/DataTable"
import { TableEmptyState } from "@/components/shared/TableEmptyState"
import { buildPurchaseOrderItemColumns } from "@/features/purchase-orders/components/detail/PurchaseOrderItemsTableColumns"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderItemsSectionProps = {
  detail: PurchaseOrderDetail
  editable: boolean
}

// Section header + table, same "tiêu đề dải" idiom as PurchaseRequestItemsSection.tsx — a
// single-section screen doesn't earn a Tabs strip. No pagination — a PO's line count is small
// and comes back in one response.
export function PurchaseOrderItemsSection({
  detail,
  editable,
}: PurchaseOrderItemsSectionProps) {
  const columns = useMemo(
    () => buildPurchaseOrderItemColumns(editable),
    [editable]
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Chi tiết vật tư
      </h3>

      <DataTable
        rows={detail.items}
        columns={columns}
        isPending={false}
        bare
        emptyState={
          <TableEmptyState
            icon={PackageSearch}
            title="Chưa có vật tư nào"
            description="Đơn mua hàng này chưa có dòng vật tư nào."
          />
        }
      />
    </div>
  )
}
