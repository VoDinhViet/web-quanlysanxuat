import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import type { UpdateOutboundOrderItemValue } from "@/features/outbound-orders/schemas/update-outbound-order.schema"
import type { ItemRef } from "@/lib/types/item.type"
import type { Unit } from "@/lib/types/unit.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Dữ liệu hiển thị (order/job/item/unit + 4 cột tồn kho) cho một dòng đang sửa — không có trong
// form state (schema chỉ giữ 5 field wire, xem update-outbound-order.schema.ts). Nguồn: dòng có
// sẵn lúc tải trang (OutboundOrderItem) hoặc dòng vừa thêm qua popup (UnfulfilledOrderItem) —
// OutboundOrderEditItemsSection.tsx build Map này, khớp theo `orderItemId`.
export type OutboundOrderItemDisplay = {
  order: { id: string; code: string }
  job: { id: string; code: string } | null
  item: ItemRef
  unit: Unit
  orderedQuantity: number
  issuedQuantity: number
  onHandQuantity: number
  heldQuantity: number
  availableQuantity: number
}

const editItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  UpdateOutboundOrderItemValue
>()

type BuildOutboundOrderEditItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
  displayByOrderItemId: Map<string, OutboundOrderItemDisplay>
}

// 4 cột tồn kho (BUG-090, mở rộng theo UI Spec) là snapshot lúc tải trang/lúc thêm dòng — không
// tự tính lại khi người dùng sửa SL tại chỗ, chỉ để tham khảo. Chốt chặn thật (E194) vẫn ở BE lúc
// lưu, xem docs/domains/inventory.md mục "Giao hàng".
export function buildOutboundOrderEditItemColumns({
  itemsField,
  disabled,
  displayByOrderItemId,
}: BuildOutboundOrderEditItemColumnsArgs) {
  return editItemColumnHelper.columns([
    editItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    editItemColumnHelper.display({
      id: "orderCode",
      header: "PO",
      meta: { headerClassName: "min-w-24" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? (
          <Link
            to="/manage/orders/$orderId"
            params={{ orderId: display.order.id }}
            className="font-mono text-xs text-primary hover:underline"
          >
            {display.order.code}
          </Link>
        ) : (
          "—"
        )
      },
    }),
    editItemColumnHelper.display({
      id: "jobCode",
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
      cell: ({ row }) =>
        displayByOrderItemId.get(row.original.orderItemId)?.job?.code ?? "—",
    }),
    editItemColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-40" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return (
          <div>
            <p className="text-xs font-semibold text-foreground">
              {display?.item.name ?? "—"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {display?.item.code}
            </p>
          </div>
        )
      },
    }),
    editItemColumnHelper.display({
      id: "unitName",
      header: "ĐVT",
      meta: { headerClassName: "w-14", cellClassName: "text-muted-foreground" },
      cell: ({ row }) =>
        displayByOrderItemId.get(row.original.orderItemId)?.unit.name ?? "—",
    }),
    editItemColumnHelper.display({
      id: "orderedQuantity",
      header: "SL PO",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.orderedQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "issuedQuantity",
      header: "Đã giao",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.issuedQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "onHandQuantity",
      header: "Tồn TP",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.onHandQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "heldQuantity",
      header: "Đã giữ",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.heldQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "availableQuantity",
      header: "Có thể giao",
      meta: { headerClassName: "w-24 text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return (
          <span className="font-semibold text-emerald-600 tabular-nums">
            {display
              ? quantityFormatter.format(display.availableQuantity)
              : "—"}
          </span>
        )
      },
    }),
    editItemColumnHelper.display({
      id: "quantity",
      header: () => (
        <>
          SL giao <span className="text-destructive">*</span>
        </>
      ),
      meta: { headerClassName: "w-28 text-right" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.quantity}
            min={1}
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, quantity: value })
            }
          />
        )
      },
    }),
    editItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-36" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <TableTextCellInput
            value={item.note}
            placeholder="Ghi chú (nếu có)"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, note: value })
            }
          />
        )
      },
    }),
    editItemColumnHelper.display({
      id: "actions",
      header: "",
      meta: {
        headerClassName: "w-12 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <TooltipTrigger>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Bỏ dòng ${row.index + 1}`}
            className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
            isDisabled={disabled}
            onPress={() => itemsField.removeValue(row.index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Tooltip>{`Bỏ dòng ${row.index + 1}`}</Tooltip>
        </TooltipTrigger>
      ),
    }),
  ])
}
