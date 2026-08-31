import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

const purchaseQuotationItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseQuotationItemDetail
>()

// Read-only twin of CreateQuotationSuppliersItemColumns.tsx's outer columns — no "Thao tác"
// column and no inputs, so this is a plain module-level array rather than a factory (no
// per-instance state to close over, unlike the create-flow version).
export const purchaseQuotationItemsColumns =
  purchaseQuotationItemColumnHelper.columns([
    purchaseQuotationItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    purchaseQuotationItemColumnHelper.accessor((row) => row.item.code, {
      id: "itemCode",
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-32",
        cellClassName: "font-mono text-primary",
      },
    }),
    purchaseQuotationItemColumnHelper.accessor((row) => row.item.name, {
      id: "itemName",
      header: "Tên vật tư",
    }),
    purchaseQuotationItemColumnHelper.accessor((row) => row.item.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    // Tổng SL đề xuất của mọi dòng ĐXMH đã gộp vào vật tư này — chi tiết từng dòng xem bảng con
    // "Nguồn ĐXMH" (PurchaseQuotationAllocationsTable.tsx).
    purchaseQuotationItemColumnHelper.display({
      id: "requestedQuantity",
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) =>
        row.original.allocations.reduce(
          (sum, allocation) => sum + allocation.purchaseRequestItem.quantity,
          0
        ),
    }),
    purchaseQuotationItemColumnHelper.accessor("quantity", {
      header: "SL báo giá",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums font-medium",
      },
    }),
  ])
