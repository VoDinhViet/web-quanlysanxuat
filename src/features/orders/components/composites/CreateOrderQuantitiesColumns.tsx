import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

const createOrderQuantitiesColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  OrderItemFormValue
>()

type BuildCreateOrderQuantitiesColumnsArgs = {
  itemsField: AnyFieldApi
  disabled: boolean
  currency: string
}

// Own useReactTable columns cho nửa đầu bước ③ đã gộp (CreateOrderQuantitiesStep.tsx) — mỗi cell
// mutate `itemsField` trực tiếp qua `row.index`, cùng idiom
// PurchaseRequestCreateQuantityColumns.tsx. Header "Đơn giá" đổi theo `currency` sống — truyền
// tay thay vì đọc lại trong cell vì header không có `row`.
export function buildCreateOrderQuantitiesColumns({
  itemsField,
  disabled,
  currency,
}: BuildCreateOrderQuantitiesColumnsArgs) {
  return createOrderQuantitiesColumnHelper.columns([
    createOrderQuantitiesColumnHelper.display({
      id: "index",
      header: "#",
      meta: { headerClassName: "w-12" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    createOrderQuantitiesColumnHelper.accessor("itemLabel", {
      header: "Sản phẩm",
      cell: ({ getValue }) => getValue() || "—",
    }),
    createOrderQuantitiesColumnHelper.accessor("itemUnit", {
      header: "ĐVT",
      cell: ({ getValue }) => getValue() || "—",
    }),
    createOrderQuantitiesColumnHelper.display({
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
    createOrderQuantitiesColumnHelper.display({
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
    createOrderQuantitiesColumnHelper.display({
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
    createOrderQuantitiesColumnHelper.display({
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
    createOrderQuantitiesColumnHelper.display({
      id: "total",
      header: "Thành tiền",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {currencyFormatter.format(estimateLineTotal(row.original))}
        </span>
      ),
    }),
    createOrderQuantitiesColumnHelper.display({
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
