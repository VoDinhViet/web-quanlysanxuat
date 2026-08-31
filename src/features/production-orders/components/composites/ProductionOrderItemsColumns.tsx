import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { ReactNode } from "react"

import type { ProductionOrderDetailItem } from "@/lib/types/production-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const productionOrderItemsColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductionOrderDetailItem
>()

type BuildProductionOrderItemsColumnsArgs = {
  // Rendered by the caller (where `form` is fully typed via `withForm`) rather than taking
  // `form` here — `AnyFormApi` doesn't carry the `.Field` render-prop typings, only the
  // concrete `useAppForm`/`withForm` instance does.
  renderQuantityCell: (
    item: ProductionOrderDetailItem,
    index: number
  ) => ReactNode
}

export function buildProductionOrderItemsColumns({
  renderQuantityCell,
}: BuildProductionOrderItemsColumnsArgs) {
  return productionOrderItemsColumnHelper.columns([
    productionOrderItemsColumnHelper.display({
      id: "index",
      header: "#",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    productionOrderItemsColumnHelper.accessor((item) => item.item.code, {
      id: "code",
      header: "Mã sản phẩm",
      meta: { cellClassName: "font-mono text-xs" },
    }),
    productionOrderItemsColumnHelper.accessor((item) => item.item.name, {
      id: "name",
      header: "Tên sản phẩm",
      meta: { cellClassName: "font-medium text-foreground" },
    }),
    productionOrderItemsColumnHelper.accessor("orderQty", {
      header: "SL theo đơn hàng",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.accessor("onHandQty", {
      header: "Tồn kho TP (Hiện có)",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right font-medium text-info tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.accessor("availableQty", {
      header: "Tồn kho TP (Khả dụng)",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right font-medium text-info tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    productionOrderItemsColumnHelper.display({
      id: "quantity",
      header: "Số lượng sản xuất",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => renderQuantityCell(row.original, row.index),
    }),
    productionOrderItemsColumnHelper.accessor("fromStockQty", {
      header: "Lấy từ tồn",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right text-muted-foreground tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
  ])
}
