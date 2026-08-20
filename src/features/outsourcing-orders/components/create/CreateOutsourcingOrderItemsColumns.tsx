import { createColumnHelper } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { IconButton } from "@/components/shared/buttons/IconButton"
import { NumericCellInput } from "@/components/shared/inputs/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/inputs/TableTextCellInput"
import type { CreateOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const createOutsourcingOrderItemColumnHelper =
  createColumnHelper<CreateOutsourcingOrderItemValue>()

type BuildCreateOutsourcingOrderItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns cho bước ② — mỗi ô ghi trực tiếp vào `itemsField` qua row.index,
// cùng idiom InventoryReceiptCreateFromPoItemsColumns.tsx. SL gửi vượt "Còn được phép gửi" vẫn gõ
// được (không khoá phím) nhưng bị chặn ở submit qua schema's `.refine` — dòng cảnh báo dưới ô chỉ
// là gợi ý tức thời.
export function buildCreateOutsourcingOrderItemColumns({
  itemsField,
  disabled,
}: BuildCreateOutsourcingOrderItemColumnsArgs) {
  return [
    createOutsourcingOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    createOutsourcingOrderItemColumnHelper.accessor("productionJobCode", {
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
    }),
    createOutsourcingOrderItemColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.itemName}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.itemCode}
          </p>
        </div>
      ),
    }),
    createOutsourcingOrderItemColumnHelper.accessor("operationName", {
      header: "Công đoạn",
      meta: { headerClassName: "min-w-28" },
    }),
    createOutsourcingOrderItemColumnHelper.accessor("unitName", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-14",
        cellClassName: "text-muted-foreground",
      },
    }),
    createOutsourcingOrderItemColumnHelper.accessor("plannedQuantity", {
      header: "SL định mức",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    createOutsourcingOrderItemColumnHelper.accessor("sentQuantity", {
      header: "Đã gửi",
      meta: {
        headerClassName: "w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    createOutsourcingOrderItemColumnHelper.accessor("remainingQuantity", {
      header: "Còn được phép",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    createOutsourcingOrderItemColumnHelper.display({
      id: "quantity",
      header: "SL gửi lần này",
      meta: { headerClassName: "w-32 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const exceedsRemaining = (item.quantity ?? 0) > item.remainingQuantity

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
            {exceedsRemaining && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt còn được phép (
                {quantityFormatter.format(item.remainingQuantity)})
              </p>
            )}
          </div>
        )
      },
    }),
    createOutsourcingOrderItemColumnHelper.display({
      id: "weight",
      header: "Trọng lượng (kg)",
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.weight}
            placeholder="—"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, weight: value })
            }
          />
        )
      },
    }),
    createOutsourcingOrderItemColumnHelper.display({
      id: "area",
      header: "Diện tích (m²)",
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.area}
            placeholder="—"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, area: value })
            }
          />
        )
      },
    }),
    createOutsourcingOrderItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `os-out-note-${row.index}`
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
    createOutsourcingOrderItemColumnHelper.display({
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
          <Trash2 className="size-3.5" />
        </IconButton>
      ),
    }),
  ]
}
