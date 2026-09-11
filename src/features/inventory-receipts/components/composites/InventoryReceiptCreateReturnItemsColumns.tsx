import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { InventoryReceiptItemFormValue } from "@/features/inventory-receipts/schemas/inventory-receipt-item-form.schema"

const inventoryReceiptReturnItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  InventoryReceiptItemFormValue
>()

type BuildInventoryReceiptReturnItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns cho bước ③, cùng khuôn InventoryReceiptCreateFromPoItemsColumns.tsx —
// không có cột "SL đặt"/"Còn lại" (không có PO đối chiếu ở lane này), có thêm "Đơn giá" (tuỳ chọn,
// cùng field InventoryReceiptItemDialog.tsx vốn đang bị thay thế cho lane này).
export function buildInventoryReceiptReturnItemColumns({
  itemsField,
  disabled,
}: BuildInventoryReceiptReturnItemColumnsArgs) {
  return inventoryReceiptReturnItemColumnHelper.columns([
    inventoryReceiptReturnItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    inventoryReceiptReturnItemColumnHelper.accessor("itemLabel", {
      header: "Vật tư",
      meta: { cellClassName: "font-medium text-foreground" },
    }),
    inventoryReceiptReturnItemColumnHelper.accessor("itemUnit", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),
    inventoryReceiptReturnItemColumnHelper.display({
      id: "quantity",
      header: "Số lượng",
      meta: { headerClassName: "w-32 text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.quantity}
            min={0}
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, quantity: value })
            }
          />
        )
      },
    }),
    inventoryReceiptReturnItemColumnHelper.display({
      id: "unitPrice",
      header: "Đơn giá",
      meta: { headerClassName: "w-32 text-right" },
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
    inventoryReceiptReturnItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `inventory-receipt-return-note-${row.index}`
        return (
          <>
            <label htmlFor={inputId} className="sr-only">
              Ghi chú — {item.itemLabel}
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
    inventoryReceiptReturnItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Bỏ dòng ${row.index + 1}`}
                className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                disabled={disabled}
                onClick={() => itemsField.removeValue(row.index)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>{`Bỏ dòng ${row.index + 1}`}</TooltipContent>
        </Tooltip>
      ),
    }),
  ])
}
