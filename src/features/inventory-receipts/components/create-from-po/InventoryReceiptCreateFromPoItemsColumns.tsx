import { createColumnHelper } from "@tanstack/react-table"
import type { AnyFieldApi } from "@tanstack/react-form"
import { TrashBinTrash } from "@solar-icons/react"

import { IconButton } from "@/components/shared/IconButton"
import { NumericCellInput } from "@/components/shared/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/TableTextCellInput"
import type { InventoryReceiptFromPoItemValue } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const inventoryReceiptFromPoItemColumnHelper =
  createColumnHelper<InventoryReceiptFromPoItemValue>()

type BuildInventoryReceiptFromPoItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns cho bước ③ — mỗi ô ghi trực tiếp vào `itemsField` qua
// `row.index`/`row.original`, cùng idiom PurchaseRequestCreateQuantityColumns.tsx. SL nhận vượt
// SL đặt vẫn gõ được (không khoá phím) nhưng bị chặn ở submit qua schema's `.refine` — dòng cảnh
// báo dưới ô chỉ là gợi ý tức thời, không phải nguồn validate duy nhất.
export function buildInventoryReceiptFromPoItemColumns({
  itemsField,
  disabled,
}: BuildInventoryReceiptFromPoItemColumnsArgs) {
  return [
    inventoryReceiptFromPoItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    inventoryReceiptFromPoItemColumnHelper.accessor("itemLabel", {
      header: "Vật tư",
      meta: { cellClassName: "font-medium text-foreground" },
    }),
    inventoryReceiptFromPoItemColumnHelper.accessor("itemUnit", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),
    inventoryReceiptFromPoItemColumnHelper.accessor("requestedQuantity", {
      header: "SL đặt",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    inventoryReceiptFromPoItemColumnHelper.display({
      id: "quantity",
      header: "SL nhận lần này",
      meta: { headerClassName: "w-36 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `inventory-receipt-from-po-quantity-${row.index}`
        const exceedsOrdered =
          (Number(item.quantity) || 0) > item.requestedQuantity

        return (
          <div>
            <label htmlFor={inputId} className="sr-only">
              Số lượng nhận lần này — {item.itemLabel}
            </label>
            <NumericCellInput
              id={inputId}
              value={item.quantity}
              min={1}
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, quantity: value })
              }
            />
            {exceedsOrdered && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL đặt ({quantityFormatter.format(item.requestedQuantity)})
              </p>
            )}
          </div>
        )
      },
    }),
    inventoryReceiptFromPoItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `inventory-receipt-from-po-note-${row.index}`
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
    inventoryReceiptFromPoItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <IconButton
          label={`Bỏ dòng ${row.index + 1}`}
          className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
          disabled={disabled}
          onClick={() => itemsField.removeValue(row.index)}
        >
          <TrashBinTrash className="size-3.5" />
        </IconButton>
      ),
    }),
  ]
}
