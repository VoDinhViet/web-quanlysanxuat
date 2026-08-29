import { createColumnHelper } from "@tanstack/react-table"

import type { PurchaseQuotationItemAllocationDetail } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationAllocationColumnHelper =
  createColumnHelper<PurchaseQuotationItemAllocationDetail>()

// Read-only, same header/cell classes as PurchaseQuotationSupplierCompareColumns.tsx's inner
// columns (h-8 header, text-[10px] labels) — the two nested tables sit stacked in the same outer
// row, so they read as one visual family.
export const purchaseQuotationAllocationsColumns = [
  purchaseQuotationAllocationColumnHelper.accessor(
    (row) => row.purchaseRequestItem.purchaseRequest.code,
    {
      id: "prCode",
      header: "Mã PR",
      meta: {
        headerClassName: "w-32 text-[10px]",
        cellClassName: "font-mono text-xs font-medium text-primary",
      },
    }
  ),
  purchaseQuotationAllocationColumnHelper.accessor(
    (row) => row.purchaseRequestItem.quantity,
    {
      id: "requestedQuantity",
      header: "SL đề xuất",
      meta: {
        headerClassName: "w-28 text-right text-[10px]",
        cellClassName: "text-right tabular-nums",
      },
    }
  ),
  purchaseQuotationAllocationColumnHelper.accessor("quantity", {
    header: "SL báo giá",
    meta: {
      headerClassName: "w-28 text-right text-[10px]",
      cellClassName: "text-right tabular-nums font-medium",
    },
  }),
  purchaseQuotationAllocationColumnHelper.accessor(
    (row) => row.quantityAdjustmentReason ?? "—",
    {
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: {
        headerClassName: "text-[10px]",
        cellClassName: "text-xs text-muted-foreground",
      },
      cell: ({ getValue }) => (
        <span className="line-clamp-2">{getValue()}</span>
      ),
    }
  ),
]
