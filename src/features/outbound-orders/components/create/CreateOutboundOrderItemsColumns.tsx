import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { IconButton } from "@/components/shared/buttons/IconButton"
import { NumericCellInput } from "@/components/shared/inputs/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/inputs/TableTextCellInput"
import type { CreateOutboundOrderItemValue } from "@/features/outbound-orders/schemas/create-outbound-order.schema"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const createOutboundOrderItemColumnHelper =
  createColumnHelper<CreateOutboundOrderItemValue>()

type BuildCreateOutboundOrderItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  lookupUnfulfilledOrderItem: (
    orderItemId: string
  ) => UnfulfilledOrderItem | undefined
}

// Own useReactTable columns cho bước ② — mỗi ô ghi trực tiếp vào `itemsField` qua row.index, cùng
// idiom CreateOutsourcingReceiptItemsColumns.tsx. Order/Job/Item/Unit/SL đặt không nằm trong item
// value (schema chỉ giữ 5 field gửi BE) — tra lại qua `lookupUnfulfilledOrderItem` (cache React
// Query, xem useUnfulfilledOrderItemLookup). SL giao vượt "SL đặt" vẫn gõ được (không khoá phím);
// dòng cảnh báo dưới ô chỉ là gợi ý hiển thị — BE tự chặn khi tạo phiếu (E193), FE không chặn nút
// submit nữa.
export function buildCreateOutboundOrderItemColumns({
  itemsField,
  disabled,
  lookupUnfulfilledOrderItem,
}: BuildCreateOutboundOrderItemColumnsArgs) {
  return [
    createOutboundOrderItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "orderCode",
      header: "PO",
      meta: { headerClassName: "min-w-24" },
      cell: ({ row }) => {
        const source = lookupUnfulfilledOrderItem(row.original.orderItemId)
        if (!source) return "—"
        return (
          <Link
            to="/manage/orders/$orderId"
            params={{ orderId: source.order.id }}
            className="font-mono text-xs text-primary hover:underline"
          >
            {source.order.code}
          </Link>
        )
      },
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "jobCode",
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
      cell: ({ row }) =>
        lookupUnfulfilledOrderItem(row.original.orderItemId)?.job?.code ?? "—",
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => {
        const source = lookupUnfulfilledOrderItem(row.original.orderItemId)
        return (
          <div>
            <p className="text-xs font-semibold text-foreground">
              {source?.item.name ?? "—"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {source?.item.code}
            </p>
          </div>
        )
      },
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "unitName",
      header: "ĐVT",
      meta: {
        headerClassName: "w-14",
        cellClassName: "text-muted-foreground",
      },
      cell: ({ row }) =>
        lookupUnfulfilledOrderItem(row.original.orderItemId)?.unit.name ?? "—",
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "orderedQuantity",
      header: "SL đặt",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) => {
        const orderedQuantity = lookupUnfulfilledOrderItem(
          row.original.orderItemId
        )?.orderedQuantity
        return orderedQuantity === undefined
          ? "—"
          : quantityFormatter.format(orderedQuantity)
      },
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "quantity",
      header: "SL giao",
      meta: { headerClassName: "w-32 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const source = lookupUnfulfilledOrderItem(item.orderItemId)
        const exceedsOrdered =
          source !== undefined && (item.quantity ?? 0) > source.orderedQuantity

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
            {exceedsOrdered && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL đặt ({quantityFormatter.format(source.orderedQuantity)})
              </p>
            )}
          </div>
        )
      },
    }),
    createOutboundOrderItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        const source = lookupUnfulfilledOrderItem(item.orderItemId)
        const inputId = `do-note-${row.index}`
        return (
          <>
            <label htmlFor={inputId} className="sr-only">
              Ghi chú — {source?.item.name}
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
    createOutboundOrderItemColumnHelper.display({
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
