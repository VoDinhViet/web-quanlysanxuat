import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
      id: "poJob",
      header: "PO / Job",
      meta: { headerClassName: "min-w-24" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        if (!display) return "—"
        return (
          <div className="flex flex-col gap-0.5">
            <Link
              to="/manage/orders/$orderId"
              params={{ orderId: display.order.id }}
              className="font-mono text-xs font-semibold text-primary hover:underline"
            >
              {display.order.code}
            </Link>
            {display.job ? (
              <Link
                to="/manage/production-jobs/$productionJobId"
                params={{ productionJobId: display.job.id }}
                search={{ tab: "info" }}
                className="font-mono text-[11px] text-muted-foreground hover:text-primary hover:underline"
              >
                {display.job.code}
              </Link>
            ) : (
              <span className="text-[11px] text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    }),
    editItemColumnHelper.display({
      id: "product",
      header: "Sản phẩm",
      meta: { headerClassName: "min-w-44" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        if (!display) return "—"
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground text-xs leading-tight">
              {display.item.name}
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span>{display.item.code}</span>
              <span>·</span>
              <span>ĐVT: {display.unit.name}</span>
            </div>
          </div>
        )
      },
    }),
    editItemColumnHelper.display({
      id: "orderedQuantity",
      header: "SL PO",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right tabular-nums" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.orderedQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "issuedQuantity",
      header: "Đã giao",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right tabular-nums" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        return display ? quantityFormatter.format(display.issuedQuantity) : "—"
      },
    }),
    editItemColumnHelper.display({
      id: "onHandQuantity",
      header: "Tồn TP",
      meta: { headerClassName: "w-20 text-right", cellClassName: "text-right tabular-nums" },
      cell: ({ row }) => {
        const display = displayByOrderItemId.get(row.original.orderItemId)
        if (!display) return "—"
        return (
          <div className="flex flex-col items-end gap-0.5">
            <span>{quantityFormatter.format(display.onHandQuantity)}</span>
            {display.heldQuantity > 0 ? (
              <span className="text-[10px] text-muted-foreground">
                (Giữ: {quantityFormatter.format(display.heldQuantity)})
              </span>
            ) : null}
          </div>
        )
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
