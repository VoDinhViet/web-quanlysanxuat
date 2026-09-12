import { createColumnHelper } from "@tanstack/react-table"
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
    // Vật tư trùng do gộp nhiều dòng ĐXMH ở RFQ vẫn tách lại thành nhiều dòng PO (1 dòng PO ↔ 1
    // dòng ĐXMH — bất biến bắt buộc cho sổ cái mua hàng/nhập kho), nên 2 dòng cùng vật tư chỉ khác
    // nhau ở Mã PR — cột này giúp phân biệt thay vì trông như bị trùng/lỗi.
    purchaseOrderItemColumnHelper.accessor(
      (row) => row.purchaseRequestItem.purchaseRequest.code,
      {
        id: "prCode",
        header: "Mã PR",
        meta: { headerClassName: "min-w-28" },
        cell: ({ getValue }) => (
          <span className="font-mono text-muted-foreground">{getValue()}</span>
        ),
      }
    ),
    purchaseOrderItemColumnHelper.accessor(
      (row) => row.purchaseRequestItem.item.code,
      {
        id: "code",
        header: "Mã vật tư",
        meta: { headerClassName: "min-w-32" },
        cell: ({ getValue }) => (
          <span className="font-mono font-semibold text-foreground">
            {getValue()}
          </span>
        ),
      }
    ),
    purchaseOrderItemColumnHelper.accessor(
      (row) => row.purchaseRequestItem.item.name,
      {
        id: "name",
        header: "Tên vật tư",
        meta: { headerClassName: "min-w-44" },
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">{getValue()}</span>
        ),
      }
    ),
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
                ? "text-success font-semibold"
                : received > 0
                  ? "text-amber-600 dark:text-amber-400 font-semibold"
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
                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-foreground"
            )}
          >
            {remaining === 0 ? "—" : quantityFormatter.format(remaining)}
          </span>
        )
      },
    }),
    purchaseOrderItemColumnHelper.accessor("quantityAdjustmentReason", {
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-40" },
      cell: ({ getValue }) => (
        <span className="truncate text-xs text-muted-foreground">
          {getValue() ?? "—"}
        </span>
      ),
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
