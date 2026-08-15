import { createColumnHelper } from "@tanstack/react-table"
import { AltArrowDown } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { PurchaseOrderAdjustmentReasonDialog } from "@/features/purchase-orders/components/detail/PurchaseOrderAdjustmentReasonDialog"
import { PurchaseOrderItemQuantityCell } from "@/features/purchase-orders/components/detail/PurchaseOrderItemQuantityCell"
import { PurchaseOrderItemUnitPriceCell } from "@/features/purchase-orders/components/detail/PurchaseOrderItemUnitPriceCell"
import { cn } from "@/lib/utils"
import type { PurchaseOrderItemDetail } from "@/lib/types/purchase-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const priceFormatter = new Intl.NumberFormat("vi-VN")

const purchaseOrderItemColumnHelper =
  createColumnHelper<PurchaseOrderItemDetail>()

// A factory (paired with `useMemo` at the call site) rather than a module-scope constant — the
// last 2 columns gate on `editable` (permission + PO status), same reason
// buildPurchaseRequestItemColumns is a factory. Both editable cells own their own mutation
// (read `purchaseOrderId` via `useParams`), so no per-row callbacks are threaded through here.
export function buildPurchaseOrderItemColumns(editable: boolean) {
  return [
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
    purchaseOrderItemColumnHelper.display({
      id: "quantity",
      header: "SL đặt",
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => (
        <PurchaseOrderItemQuantityCell
          purchaseOrderItemId={row.original.id}
          itemName={row.original.purchaseRequestItem.item.name}
          quantity={row.original.quantity}
          editable={editable}
        />
      ),
    }),
    purchaseOrderItemColumnHelper.display({
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        if (!editable) {
          return (
            <span className="truncate text-xs text-muted-foreground">
              {row.original.quantityAdjustmentReason ?? "—"}
            </span>
          )
        }

        const item = row.original
        const hasReason = (item.quantityAdjustmentReason ?? "").length > 0

        return (
          <PurchaseOrderAdjustmentReasonDialog
            purchaseOrderItemId={item.id}
            itemName={item.purchaseRequestItem.item.name}
            reason={item.quantityAdjustmentReason ?? ""}
            trigger={
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-8 w-full max-w-40 justify-between text-xs font-normal",
                  !hasReason && "border-dashed text-muted-foreground"
                )}
              >
                <span className="max-w-32 min-w-0 truncate">
                  {hasReason ? item.quantityAdjustmentReason : "Thêm lý do"}
                </span>
                <AltArrowDown className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            }
          />
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "unitPrice",
      header: "Đơn giá PO",
      meta: { headerClassName: "w-32 text-right" },
      cell: ({ row }) => (
        <PurchaseOrderItemUnitPriceCell
          purchaseOrderItemId={row.original.id}
          itemName={row.original.purchaseRequestItem.item.name}
          unitPrice={row.original.unitPrice}
          editable={editable}
        />
      ),
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
  ]
}
