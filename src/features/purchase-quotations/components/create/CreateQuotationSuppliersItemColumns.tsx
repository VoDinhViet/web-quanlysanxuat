import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Trash2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { IconButton } from "@/components/shared/IconButton"
import { NumericCellInput } from "@/features/purchase-quotations/components/create/NumericCellInput"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationItemColumnHelper = createColumnHelper<PickedQuotationItemValue>()

type BuildQuotationSuppliersItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns for the outer (per-vật tư) table in CreateQuotationSuppliersSection —
// each cell mutates `itemsField` directly via `row.index`/`row.original`, same idiom as
// CreateQuotationItemsPickerColumns.tsx's `onToggleRow`.
export function buildQuotationSuppliersItemColumns({
  itemsField,
  disabled,
}: BuildQuotationSuppliersItemColumnsArgs) {
  return [
    quotationItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    quotationItemColumnHelper.accessor("itemCode", {
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-32",
        cellClassName: "font-mono text-primary",
      },
    }),
    quotationItemColumnHelper.accessor("itemName", {
      header: "Tên vật tư",
    }),
    quotationItemColumnHelper.accessor("unit", {
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    quotationItemColumnHelper.accessor("requestedQuantity", {
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
    }),
    quotationItemColumnHelper.display({
      id: "quantity",
      header: "SL báo giá",
      meta: { headerClassName: "w-32 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `quotation-item-quantity-${item.purchaseRequestItemId}`
        return (
          <>
            <label htmlFor={inputId} className="sr-only">
              SL báo giá — {item.itemName}
            </label>
            <NumericCellInput
              id={inputId}
              value={item.quantity}
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, quantity: value })
              }
            />
          </>
        )
      },
    }),
    quotationItemColumnHelper.display({
      id: "adjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <Input
            className="h-8 bg-background text-xs"
            placeholder="Lý do (nếu có)"
            value={item.adjustmentReason}
            disabled={disabled}
            onChange={(event) =>
              itemsField.replaceValue(row.index, {
                ...item,
                adjustmentReason: event.target.value,
              })
            }
          />
        )
      },
    }),
    quotationItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <IconButton
          label="Bỏ chọn vật tư"
          className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
          disabled={disabled}
          onClick={() => itemsField.removeValue(row.index)}
        >
          <Trash2 className="size-3.5" />
        </IconButton>
      ),
    }),
  ]
}
