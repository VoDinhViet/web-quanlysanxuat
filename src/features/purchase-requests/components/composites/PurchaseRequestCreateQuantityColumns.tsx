import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import type { PurchaseRequestItemFormValue } from "@/features/purchase-requests/schemas/purchase-request-item-form.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const purchaseRequestQuantityColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseRequestItemFormValue
>()

type BuildPurchaseRequestQuantityColumnsArgs = {
  itemsField: AnyFieldApi
  disabled: boolean
}

// Own useReactTable columns for the tab-2 quantity table — each cell mutates `itemsField`
// directly via `row.index`/`row.original`, same idiom as
// CreateQuotationSuppliersItemColumns.tsx's quantity/note columns.
export function buildPurchaseRequestQuantityColumns({
  itemsField,
  disabled,
}: BuildPurchaseRequestQuantityColumnsArgs) {
  return purchaseRequestQuantityColumnHelper.columns([
    purchaseRequestQuantityColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    purchaseRequestQuantityColumnHelper.accessor("itemCode", {
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-32",
        cellClassName: "font-mono text-primary",
      },
    }),
    purchaseRequestQuantityColumnHelper.accessor("itemName", {
      header: "Tên vật tư",
    }),
    purchaseRequestQuantityColumnHelper.accessor("itemUnit", {
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    purchaseRequestQuantityColumnHelper.accessor("minStock", {
      header: "Định mức tồn",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    purchaseRequestQuantityColumnHelper.display({
      id: "quantity",
      header: () => (
        <>
          Số lượng đề xuất <span className="text-destructive">*</span>
        </>
      ),
      meta: { headerClassName: "w-40 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const quantityNumber = item.quantity ?? 0
        // Reference-only gợi ý, not a validation error — a request below định mức tồn is a
        // valid business reason to buy less, so this never blocks submit (see the schema's own
        // positive-number check, the only rule that does).
        const isBelowMinStock =
          quantityNumber > 0 && quantityNumber < item.minStock

        return (
          <div>
            <NumericCellInput
              value={item.quantity}
              min={1}
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, quantity: value })
              }
            />
            {isBelowMinStock && (
              <p className="mt-1 text-right text-[10px] text-warning">
                Thấp hơn định mức tồn ({quantityFormatter.format(item.minStock)}
                )
              </p>
            )}
          </div>
        )
      },
    }),
    purchaseRequestQuantityColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `purchase-request-item-note-${row.index}`
        return (
          <>
            <label htmlFor={inputId} className="sr-only">
              Ghi chú — {item.itemName}
            </label>
            <TableTextCellInput
              id={inputId}
              value={item.note}
              placeholder="Ghi chú (nếu có)"
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, note: value })
              }
            />
          </>
        )
      },
    }),
    purchaseRequestQuantityColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <TooltipTrigger>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Bỏ chọn dòng ${row.index + 1}`}
            className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
            isDisabled={disabled}
            onPress={() => itemsField.removeValue(row.index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Tooltip>{`Bỏ chọn dòng ${row.index + 1}`}</Tooltip>
        </TooltipTrigger>
      ),
    }),
  ])
}
