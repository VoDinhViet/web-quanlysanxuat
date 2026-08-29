import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { AddCircle, TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { IconButton } from "@/components/shared/primitives/IconButton"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { QuotationAllocationsDialog } from "@/features/purchase-quotations/components/create/QuotationAllocationsDialog"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationItemColumnHelper = createColumnHelper<PickedQuotationItemValue>()

type BuildQuotationSuppliersItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  onOpenAddSupplier: (itemId: string) => void
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
    quotationItemColumnHelper.display({
      id: "requestedQuantity",
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) =>
        row.original.allocations.reduce(
          (sum, allocation) => sum + allocation.requestedQuantity,
          0
        ),
    }),
    quotationItemColumnHelper.display({
      id: "quantity",
      header: "SL báo giá",
      meta: { headerClassName: "w-36 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const item = row.original

        // A vật tư merging ≥2 dòng ĐXMH has ≥2 numbers to edit (one SL per allocation) — inline
        // editing only fits a single number, so that case still opens QuotationAllocationsDialog
        // to edit the breakdown. The common case (1 dòng ĐXMH, no merge) edits directly here —
        // no dialog needed just to change one number.
        if (item.allocations.length > 1) {
          const total = item.allocations.reduce(
            (sum, allocation) => sum + (allocation.quantity ?? 0),
            0
          )

          return (
            <QuotationAllocationsDialog
              itemName={item.itemName}
              allocations={item.allocations}
              onSave={(allocations) =>
                itemsField.replaceValue(row.index, { ...item, allocations })
              }
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  title={`${item.allocations.length} dòng ĐXMH`}
                  className="w-full max-w-36 justify-end text-xs font-normal tabular-nums"
                >
                  {total}
                </Button>
              }
            />
          )
        }

        const allocation = item.allocations[0]
        return (
          <NumericCellInput
            value={allocation.quantity}
            min={1}
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                allocations: [{ ...allocation, quantity: value }],
              })
            }
          />
        )
      },
    }),
    quotationItemColumnHelper.display({
      id: "quantityAdjustmentReason",
      header: "Lý do điều chỉnh SL",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original

        // A vật tư merging ≥2 dòng ĐXMH has ≥2 reasons (one per allocation) — same read/write
        // boundary as the "quantity" cell above, so editing stays inside
        // QuotationAllocationsDialog for that case; this column only edits inline when there's
        // exactly one allocation to attribute the reason to.
        if (item.allocations.length > 1) {
          return (
            <span className="text-xs text-muted-foreground">
              Xem trong SL báo giá
            </span>
          )
        }

        const allocation = item.allocations[0]
        return (
          <TableTextCellInput
            id={`quotation-item-adjustment-reason-${row.index}`}
            value={allocation.quantityAdjustmentReason}
            placeholder="Nếu SL báo giá khác SL yêu cầu"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                allocations: [
                  { ...allocation, quantityAdjustmentReason: value },
                ],
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
                    onClick={() => onOpenAddSupplier(item.itemId)}
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
