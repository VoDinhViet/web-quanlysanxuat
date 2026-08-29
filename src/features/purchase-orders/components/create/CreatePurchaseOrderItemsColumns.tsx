import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { TrashBinTrash } from "@solar-icons/react"

import { IconButton } from "@/components/shared/primitives/IconButton"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { PickedPurchaseOrderItemValue } from "@/features/purchase-orders/schemas/create-purchase-order.schema"

const purchaseOrderItemColumnHelper =
  createColumnHelper<PickedPurchaseOrderItemValue>()

type BuildPurchaseOrderItemsColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// A PO item maps 1:1 to a dòng ĐXMH (no allocation merge like RFQ's), so every cell here edits
// the row directly — no per-item breakdown dialog needed like
// CreateQuotationSuppliersItemColumns.tsx's quantity/reason cells.
export function buildPurchaseOrderItemsColumns({
  itemsField,
  disabled,
}: BuildPurchaseOrderItemsColumnsArgs) {
  return [
    purchaseOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    purchaseOrderItemColumnHelper.accessor("prCode", {
      header: "Mã PR",
      meta: {
        headerClassName: "w-24",
        cellClassName: "font-mono text-primary",
      },
    }),
    purchaseOrderItemColumnHelper.accessor("itemCode", {
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-32",
        cellClassName: "font-mono text-primary",
      },
    }),
    purchaseOrderItemColumnHelper.accessor("itemName", {
      header: "Tên vật tư",
    }),
    purchaseOrderItemColumnHelper.accessor("unit", {
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    purchaseOrderItemColumnHelper.accessor("requestedQuantity", {
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "quantity",
      header: "SL đặt mua",
      meta: { headerClassName: "w-32 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.quantity}
            min={1}
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, quantity: value })
            }
          />
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "unitPrice",
      header: "Đơn giá",
      meta: { headerClassName: "w-32 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.unitPrice}
            min={0}
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, unitPrice: value })
            }
          />
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <TableTextCellInput
            id={`purchase-order-item-adjustment-reason-${row.index}`}
            value={item.quantityAdjustmentReason}
            placeholder="Nếu SL đặt khác SL yêu cầu"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                quantityAdjustmentReason: value,
              })
            }
          />
        )
      },
    }),
    purchaseOrderItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-16 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <IconButton
          label={`Bỏ chọn dòng ${row.index + 1}`}
          className="text-destructive hover:border-destructive/30 hover:bg-destructive/10"
          disabled={disabled}
          onClick={() => itemsField.removeValue(row.index)}
        >
          <TrashBinTrash className="size-3.5" />
        </IconButton>
      ),
    }),
  ]
}
