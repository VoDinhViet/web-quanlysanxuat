import { createColumnHelper } from "@tanstack/react-table"

import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationItemColumnHelper =
  createColumnHelper<PurchaseQuotationItemDetail>()

// Read-only twin of CreateQuotationSuppliersItemColumns.tsx's outer columns — no "Thao tác"
// column and no inputs, so this is a plain module-level array rather than a factory (no
// per-instance state to close over, unlike the create-flow version).
export const purchaseQuotationItemsColumns = [
  purchaseQuotationItemColumnHelper.display({
    id: "index",
    header: "STT",
    meta: { headerClassName: "w-10" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.index + 1}</span>
    ),
  }),
  purchaseQuotationItemColumnHelper.accessor(
    (row) => row.purchaseRequestItem.item.code,
    {
      id: "itemCode",
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-32",
        cellClassName: "font-mono text-primary",
      },
    }
  ),
  purchaseQuotationItemColumnHelper.accessor(
    (row) => row.purchaseRequestItem.item.name,
    {
      id: "itemName",
      header: "Tên vật tư",
    }
  ),
  purchaseQuotationItemColumnHelper.accessor(
    (row) => row.purchaseRequestItem.item.unit.name,
    {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }
  ),
  purchaseQuotationItemColumnHelper.accessor(
    (row) => row.purchaseRequestItem.quantity,
    {
      id: "requestedQuantity",
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
    }
  ),
  purchaseQuotationItemColumnHelper.accessor("quantity", {
    header: "SL báo giá",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums font-medium",
    },
  }),
  purchaseQuotationItemColumnHelper.accessor(
    (row) => row.quantityAdjustmentReason ?? "—",
    {
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: {
        headerClassName: "w-48",
        cellClassName: "text-xs text-muted-foreground",
      },
      cell: ({ getValue }) => (
        <span className="line-clamp-2">{getValue()}</span>
      ),
    }
  ),
]
