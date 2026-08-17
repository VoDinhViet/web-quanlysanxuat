import { PackageSearch } from "lucide-react"
import { useMemo } from "react"

import { DataTable } from "@/components/shared/data/DataTable"
import { TableEmptyState } from "@/components/shared/feedback/TableEmptyState"
import { buildPurchaseOrderItemColumns } from "@/features/purchase-orders/components/detail/PurchaseOrderItemsTableColumns"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderItemsSectionProps = {
  purchaseOrder: PurchaseOrderDetail
  editable: boolean
}

// Section header + table, same "tiêu đề dải" idiom as PurchaseRequestItemsSection.tsx — a
// single-section screen doesn't earn a Tabs strip. No pagination — a PO's line count is small
// and comes back in one response.
export function PurchaseOrderItemsSection({
  purchaseOrder,
  editable,
}: PurchaseOrderItemsSectionProps) {
  const columns = useMemo(
    () => buildPurchaseOrderItemColumns(editable),
    [editable]
  )

  // BE không orderBy items — sắp theo mã vật tư (rồi mã PR) để các dòng cùng vật tư (tách từ
  // cùng 1 dòng RFQ gộp) đứng cạnh nhau, thay vì rải rác theo thứ tự BE trả về.
  const items = useMemo(
    () =>
      [...purchaseOrder.items].sort((a, b) => {
        const itemCodeCompare = a.purchaseRequestItem.item.code.localeCompare(
          b.purchaseRequestItem.item.code
        )
        if (itemCodeCompare !== 0) return itemCodeCompare

        return a.purchaseRequestItem.purchaseRequest.code.localeCompare(
          b.purchaseRequestItem.purchaseRequest.code
        )
      }),
    [purchaseOrder.items]
  )

  return (
    <div className="border-b border-border not-first:border-t">
      <h3 className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase sm:px-5">
        <PackageSearch className="size-3.5 text-muted-foreground" />
        Chi tiết vật tư
      </h3>

      <DataTable
        rows={items}
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
