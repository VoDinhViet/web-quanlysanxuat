import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { AnyFieldApi } from "@tanstack/react-form"
import { TrashBinTrash } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { InventoryReceiptFromPoItemValue } from "@/features/inventory-receipts/schemas/create-inventory-receipt-from-po.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const inventoryReceiptFromPoItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  InventoryReceiptFromPoItemValue
>()

export type BuildCreateInventoryReceiptFromPoItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Bảng được feed `filteredItems` (ô tìm kiếm ở section), nên `row.index` KHÔNG còn là index
// trong `itemsField` — mọi ô ghi phải tra lại index thật theo `purchaseOrderItemId` qua helper
// này. `row.index` giờ chỉ dùng để hiển thị (STT/nhãn "Bỏ dòng N").
function findItemIndex(
  itemsField: AnyFieldApi,
  purchaseOrderItemId: string
): number {
  const items: InventoryReceiptFromPoItemValue[] = itemsField.state.value
  return items.findIndex(
    (item) => item.purchaseOrderItemId === purchaseOrderItemId
  )
}

// Own useReactTable columns cho bước ③ — mỗi ô ghi trực tiếp vào `itemsField` qua
// `findItemIndex`, cùng idiom PurchaseRequestCreateQuantityColumns.tsx. SL nhận vượt
// SL còn lại vẫn gõ được (không khoá phím) nhưng bị chặn ở submit qua schema's `.refine` — dòng cảnh
// báo dưới ô chỉ là gợi ý tức thời, không phải nguồn validate duy nhất.
export function buildCreateInventoryReceiptFromPoItemColumns({
  itemsField,
  disabled,
}: BuildCreateInventoryReceiptFromPoItemColumnsArgs) {
  return inventoryReceiptFromPoItemColumnHelper.columns([
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
    inventoryReceiptFromPoItemColumnHelper.accessor(
      (row) => row.remainingQuantity ?? row.requestedQuantity,
      {
        id: "remainingQuantity",
        header: "Còn lại",
        meta: {
          headerClassName: "w-24 text-right",
          cellClassName: "text-right tabular-nums font-medium text-foreground",
        },
        cell: ({ getValue }) => quantityFormatter.format(getValue()),
      }
    ),
    inventoryReceiptFromPoItemColumnHelper.display({
      id: "quantity",
      header: "SL nhận lần này",
      meta: { headerClassName: "w-36 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const maxAllowed =
          item.remainingQuantity !== undefined && item.remainingQuantity > 0
            ? item.remainingQuantity
            : item.requestedQuantity
        const exceedsRemaining = (item.quantity ?? 0) > maxAllowed

        return (
          <div>
            <NumericCellInput
              value={item.quantity}
              min={1}
              disabled={disabled}
              onValueChange={(value) => {
                const index = findItemIndex(
                  itemsField,
                  item.purchaseOrderItemId
                )
                if (index >= 0) {
                  itemsField.replaceValue(index, { ...item, quantity: value })
                }
              }}
            />
            {exceedsRemaining && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL còn lại ({quantityFormatter.format(maxAllowed)})
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
        const inputId = `inventory-receipt-from-po-note-${item.purchaseOrderItemId}`
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
              onValueChange={(value) => {
                const index = findItemIndex(
                  itemsField,
                  item.purchaseOrderItemId
                )
                if (index >= 0) {
                  itemsField.replaceValue(index, { ...item, note: value })
                }
              }}
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
                onClick={() => {
                  const index = findItemIndex(
                    itemsField,
                    row.original.purchaseOrderItemId
                  )
                  if (index >= 0) {
                    itemsField.removeValue(index)
                  }
                }}
              >
                <TrashBinTrash className="size-3.5" />
              </Button>
            }
          />
          <TooltipContent>{`Bỏ dòng ${row.index + 1}`}</TooltipContent>
        </Tooltip>
      ),
    }),
  ])
}
