import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import { estimateLineTotal } from "@/features/orders/logic/order-totals"
import type { OrderItemFormValue } from "@/features/orders/schemas/order-item-form.schema"
import { currencyFormatter } from "@/lib/currency"
import { orderItemStatusLabels, OrderItemStatus } from "@/lib/types/order.type"
import { buildOptionsFromLabels, cn } from "@/lib/utils"

const orderItemStatusOptions = buildOptionsFromLabels(orderItemStatusLabels)

const updateOrderQuantitiesColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  OrderItemFormValue
>()

type BuildUpdateOrderQuantitiesColumnsArgs = {
  itemsField: AnyFieldApi
  disabled: boolean
  currency: string
}

// Own useReactTable columns cho bước ③ (UpdateOrderQuantitiesStep.tsx) — cùng khuôn
// CreateOrderQuantitiesColumns.tsx, CỘNG THÊM cột "Trạng thái" mà form Tạo không có (mọi dòng
// Tạo luôn NORMAL; huỷ 1 dòng chỉ có ý nghĩa thật trên đơn đã tồn tại). Mỗi cell mutate
// `itemsField` trực tiếp qua `row.index`.
export function buildUpdateOrderQuantitiesColumns({
  itemsField,
  disabled,
  currency,
}: BuildUpdateOrderQuantitiesColumnsArgs) {
  return updateOrderQuantitiesColumnHelper.columns([
    updateOrderQuantitiesColumnHelper.display({
      id: "index",
      header: "#",
      meta: { headerClassName: "w-12" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    updateOrderQuantitiesColumnHelper.accessor("itemLabel", {
      header: "Sản phẩm",
      cell: ({ getValue }) => getValue() || "—",
    }),
    updateOrderQuantitiesColumnHelper.accessor("itemUnit", {
      header: "ĐVT",
      cell: ({ getValue }) => getValue() || "—",
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "quantity",
      header: "Số lượng",
      meta: { headerClassName: "w-32" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.quantity}
            min={1}
            placeholder="0"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, { ...item, quantity: value })
            }
          />
        )
      },
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "unitPrice",
      header: `Đơn giá (${currency})`,
      meta: { headerClassName: "w-40" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.unitPrice}
            min={0}
            placeholder="0"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                unitPrice: value,
              })
            }
          />
        )
      },
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "discountPercent",
      header: "CK (%)",
      meta: { headerClassName: "w-24" },
      cell: ({ row }) => {
        const item = row.original
        return (
          <NumericCellInput
            value={item.discountPercent}
            min={0}
            placeholder="0"
            disabled={disabled}
            onValueChange={(value) =>
              itemsField.replaceValue(row.index, {
                ...item,
                discountPercent: value,
              })
            }
          />
        )
      },
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
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
    updateOrderQuantitiesColumnHelper.display({
      id: "status",
      header: "Trạng thái",
      meta: { headerClassName: "w-36" },
      // Commit bằng replaceValue(index, {...item, status}) — cùng lý do mọi cell khác của
      // bảng này đều đi qua itemsField trực tiếp, không qua Controller/setValue riêng: giữ
      // đúng 1 nguồn ghi cho `items`, tránh 1 lượt commit đè lên lượt vừa rồi từ ô lân cận.
      cell: ({ row }) => {
        const item = row.original
        const isCancelled = item.status === OrderItemStatus.CANCELLED

        return (
          <Select
            items={orderItemStatusOptions}
            aria-label={`Trạng thái dòng ${row.index + 1}`}
            value={item.status}
            onValueChange={(value) =>
              value !== null &&
              itemsField.replaceValue(row.index, { ...item, status: value })
            }
            disabled={disabled}
          >
            <SelectTrigger
              size="sm"
              className={cn(
                "w-full text-xs",
                isCancelled && "text-destructive"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderItemStatusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="text-xs"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "total",
      header: "Thành tiền",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => {
        const isCancelled = row.original.status === OrderItemStatus.CANCELLED
        return (
          <span
            className={cn(
              "font-medium tabular-nums",
              isCancelled && "text-muted-foreground line-through"
            )}
          >
            {currencyFormatter.format(estimateLineTotal(row.original))}
          </span>
        )
      },
    }),
    updateOrderQuantitiesColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => {
        const rowCount = itemsField.state.value.length
        const actions = [
          {
            icon: ArrowUp,
            label: `Di chuyển lên dòng ${row.index + 1}`,
            tone: "default" as const,
            disabled: disabled || row.index === 0,
            onClick: () => itemsField.moveValue(row.index, row.index - 1),
          },
          {
            icon: ArrowDown,
            label: `Di chuyển xuống dòng ${row.index + 1}`,
            tone: "default" as const,
            disabled: disabled || row.index === rowCount - 1,
            onClick: () => itemsField.moveValue(row.index, row.index + 1),
          },
          {
            icon: Trash2,
            label: `Xóa dòng ${row.index + 1}`,
            tone: "destructive" as const,
            disabled: disabled,
            onClick: () => itemsField.removeValue(row.index),
          },
        ]

        return (
          <div className="flex justify-end gap-1">
            {actions.map((action) => (
              <Tooltip key={action.label}>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={action.label}
                      className={cn(
                        "text-muted-foreground",
                        action.tone === "destructive"
                          ? "hover:border-destructive/30 hover:text-destructive"
                          : "hover:border-primary/30 hover:text-primary"
                      )}
                      disabled={action.disabled}
                      onClick={action.onClick}
                    >
                      <action.icon className="size-3.5" />
                    </Button>
                  }
                />
                <TooltipContent>{action.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )
      },
    }),
  ])
}
