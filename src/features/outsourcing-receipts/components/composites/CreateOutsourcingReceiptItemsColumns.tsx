import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { IconButton } from "@/components/shared/primitives/IconButton"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { CreateOutsourcingReceiptItemValue } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const createOutsourcingReceiptItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  CreateOutsourcingReceiptItemValue
>()

type BuildCreateOutsourcingReceiptItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns cho bước ② — mỗi ô ghi trực tiếp vào `itemsField` qua row.index, cùng
// idiom CreateOutsourcingOrderItemsColumns.tsx. SL nhận vượt "SL đã gửi" vẫn gõ được (không khoá
// phím) nhưng bị chặn ở submit qua schema's `.refine` — dòng cảnh báo dưới ô chỉ là gợi ý tức thời.
export function buildCreateOutsourcingReceiptItemColumns({
  itemsField,
  disabled,
}: BuildCreateOutsourcingReceiptItemColumnsArgs) {
  return createOutsourcingReceiptItemColumnHelper.columns([
    createOutsourcingReceiptItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    createOutsourcingReceiptItemColumnHelper.accessor("outsourcingOrderCode", {
      header: "OS-OUT",
      meta: { headerClassName: "min-w-24" },
      cell: ({ getValue, row }) => (
        <Link
          to="/manage/outsourcing-orders/$outsourcingOrderId"
          params={{ outsourcingOrderId: row.original.outsourcingOrderId }}
          className="font-mono text-xs text-primary hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    createOutsourcingReceiptItemColumnHelper.display({
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
    createOutsourcingReceiptItemColumnHelper.accessor("operationName", {
      header: "Công đoạn",
      meta: { headerClassName: "min-w-28" },
    }),
    createOutsourcingReceiptItemColumnHelper.accessor("unitName", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-14",
        cellClassName: "text-muted-foreground",
      },
    }),
    createOutsourcingReceiptItemColumnHelper.accessor("sentQuantity", {
      header: "SL đã gửi",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    createOutsourcingReceiptItemColumnHelper.display({
      id: "quantity",
      header: () => (
        <>
          SL nhận lần này <span className="text-destructive">*</span>
        </>
      ),
      meta: { headerClassName: "w-32 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const exceedsSent = (item.quantity ?? 0) > item.sentQuantity

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
            {exceedsSent && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL đã gửi ({quantityFormatter.format(item.sentQuantity)})
              </p>
            )}
          </div>
        )
      },
    }),
    createOutsourcingReceiptItemColumnHelper.display({
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
    createOutsourcingReceiptItemColumnHelper.display({
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
    createOutsourcingReceiptItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `os-in-note-${row.index}`
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
    createOutsourcingReceiptItemColumnHelper.display({
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
  ])
}
