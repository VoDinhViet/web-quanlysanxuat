import { createColumnHelper } from "@tanstack/react-table"

import { PurchaseOrderItemProductCell } from "@/features/purchase-orders/components/primitives/PurchaseOrderItemProductCell"
import type { appTableFeatures } from "@/lib/table-features"
import { cn } from "@/lib/utils"
import type { PurchaseOrderItemDetail } from "@/lib/types/purchase-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const priceFormatter = new Intl.NumberFormat("vi-VN")

const purchaseOrderItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseOrderItemDetail
>()

export function buildPurchaseOrderItemColumns(_editable?: boolean) {
  return purchaseOrderItemColumnHelper.columns([
    purchaseOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      cell: ({ row }) => row.index + 1,
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center text-muted-foreground",
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "product",
      header: "Vật tư",
      meta: { headerClassName: "min-w-64" },
      cell: ({ row }) => <PurchaseOrderItemProductCell item={row.original} />,
    }),
    purchaseOrderItemColumnHelper.accessor(
      (row) => row.purchaseRequestItem.item.unit.name,
      {
        id: "unit",
        header: "ĐVT",
        meta: { headerClassName: "w-20 text-muted-foreground" },
      }
    ),
    purchaseOrderItemColumnHelper.accessor(
      (row) => row.purchaseRequestItem.quantity,
      {
        id: "requestedQuantity",
        header: "SL yêu cầu",
        meta: {
          headerClassName: "w-28 text-center",
          cellClassName: "text-center text-muted-foreground tabular-nums",
        },
        cell: ({ getValue }) => quantityFormatter.format(getValue()),
      }
    ),
    purchaseOrderItemColumnHelper.accessor("quantity", {
      id: "quantity",
      header: "SL đặt",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    purchaseOrderItemColumnHelper.accessor("receivedQuantity", {
      id: "receivedQuantity",
      header: "SL đã nhận",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue, row }) => {
        const received = getValue()
        const ordered = row.original.quantity
        const isCompleted = received >= ordered && ordered > 0
        return (
          <span
            className={cn(
              "font-medium",
              isCompleted
                ? "font-semibold text-success"
                : received > 0
                  ? "font-semibold text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
            )}
          >
            {quantityFormatter.format(received)}
          </span>
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "remainingQuantity",
      header: "Còn lại",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) => {
        const received = row.original.receivedQuantity
        const ordered = row.original.quantity
        const remaining = Math.max(ordered - received, 0)
        return (
          <span
            className={cn(
              "font-medium",
              remaining === 0
                ? "text-muted-foreground"
                : received > 0
                  ? "font-semibold text-amber-600 dark:text-amber-400"
                  : "text-foreground"
            )}
          >
            {remaining === 0 ? "—" : quantityFormatter.format(remaining)}
          </span>
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "notes",
      header: "Ghi chú",
      meta: {
        headerClassName: "min-w-56 max-w-72",
        cellClassName: "max-w-72 py-2.5",
      },
      cell: ({ row }) => {
        const note = row.original.purchaseRequestItem.note
        const reason = row.original.quantityAdjustmentReason
        if (!note && !reason) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        return (
          <div className="flex flex-col gap-1 text-xs leading-relaxed break-words whitespace-normal">
            {note && <p className="text-muted-foreground">{note}</p>}
            {reason && (
              <p className="text-amber-600 dark:text-amber-400">
                Điều chỉnh SL: {reason}
              </p>
            )}
          </div>
        )
      },
    }),
    purchaseOrderItemColumnHelper.accessor("unitPrice", {
      id: "unitPrice",
      header: "Đơn giá PO",
      meta: {
        headerClassName: "w-32 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => {
        const unitPrice = getValue()
        return unitPrice === null ? "—" : priceFormatter.format(unitPrice)
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "lineTotal",
      header: "Thành tiền",
      meta: {
        headerClassName: "w-36 text-right",
        cellClassName: "text-right font-semibold text-foreground tabular-nums",
      },
      cell: ({ row }) => {
        const { quantity, unitPrice } = row.original
        return unitPrice === null
          ? "—"
          : priceFormatter.format(quantity * unitPrice)
      },
    }),
  ])
}
