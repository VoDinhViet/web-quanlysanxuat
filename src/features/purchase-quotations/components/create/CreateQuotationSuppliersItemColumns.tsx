import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { AddCircle, AltArrowDown, TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconButton } from "@/components/shared/IconButton"
import { AdjustmentReasonDialog } from "@/features/purchase-quotations/components/create/AdjustmentReasonDialog"
import { NumericCellInput } from "@/features/purchase-quotations/components/create/NumericCellInput"
import { cn } from "@/lib/utils"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationItemColumnHelper = createColumnHelper<PickedQuotationItemValue>()

type BuildQuotationSuppliersItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  onOpenAddSupplier: (purchaseRequestItemId: string) => void
}

// Own useReactTable columns for the outer (per-vật tư) table in CreateQuotationSuppliersSection —
// each cell mutates `itemsField` directly via `row.index`/`row.original`, same idiom as
// CreateQuotationItemsPickerColumns.tsx's `onToggleRow`.
export function buildQuotationSuppliersItemColumns({
  itemsField,
  disabled,
  onOpenAddSupplier,
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
              min={1}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, quantity: value })
              }
            />
          </>
        )
      },
    }),
    quotationItemColumnHelper.display({
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        const hasReason = item.quantityAdjustmentReason.length > 0

        // The reason can run long — a w-40 cell has no room to edit it inline, so the cell is
        // just a compact trigger and the actual Textarea lives in AdjustmentReasonDialog.
        return (
          <AdjustmentReasonDialog
            itemName={item.itemName}
            reason={item.quantityAdjustmentReason}
            onSave={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                quantityAdjustmentReason: value,
              })
            }
            trigger={
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
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
    quotationItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-20 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <IconButton
                    label="Thêm NCC"
                    disabled={disabled}
                    onClick={() =>
                      onOpenAddSupplier(item.purchaseRequestItemId)
                    }
                  >
                    <AddCircle className="size-3.5" />
                  </IconButton>
                </span>
              </TooltipTrigger>
              <TooltipContent>Thêm NCC</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <IconButton
                    label="Bỏ chọn vật tư"
                    className="text-destructive hover:border-destructive/30 hover:bg-destructive/10"
                    disabled={disabled}
                    onClick={() => itemsField.removeValue(row.index)}
                  >
                    <TrashBinTrash className="size-3.5" />
                  </IconButton>
                </span>
              </TooltipTrigger>
              <TooltipContent>Bỏ chọn vật tư</TooltipContent>
            </Tooltip>
          </div>
        )
      },
    }),
  ]
}
