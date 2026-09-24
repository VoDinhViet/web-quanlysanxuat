import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import { OrderStatusBadge } from "@/features/orders/components/primitives/OrderBadges"
import {
  DateCell,
  DueDateCell,
  MoneyCell,
  OrderActionsCell,
} from "@/features/orders/components/primitives/OrderTableCells"
import { paymentTermShortLabels } from "@/lib/types/payment-term.type"
import type { Order } from "@/lib/types/order.type"

const orderColumnHelper = createColumnHelper<typeof appTableFeatures, Order>()

export type BuildOrderColumnsOptions = {
  selectedOrderIds: Set<string>
  onToggleOrder: (orderId: string) => void
  onToggleAll: (checked: boolean) => void
  allChecked: boolean
  isIndeterminate?: boolean
}

export function buildOrderColumns(options?: BuildOrderColumnsOptions) {
  const selectColumn = options
    ? [
        orderColumnHelper.display({
          id: "select",
          header: () => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={options.allChecked}
                indeterminate={options.isIndeterminate}
                onCheckedChange={options.onToggleAll}
                aria-label="Chọn tất cả đơn hàng trên trang này"
              />
            </div>
          ),
          meta: {
            headerClassName: "w-10 px-2 text-center",
            cellClassName: "w-10 px-2 text-center",
          },
          cell: ({ row }) => (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={options.selectedOrderIds.has(row.original.id)}
                onCheckedChange={() => options.onToggleOrder(row.original.id)}
                aria-label={`Chọn đơn hàng ${row.original.code}`}
              />
            </div>
          ),
        }),
      ]
    : []

  return orderColumnHelper.columns([
    ...selectColumn,
    orderColumnHelper.accessor("code", {
      header: "Mã đơn hàng",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="font-mono font-semibold text-primary">
          {getValue()}
        </span>
      ),
    }),
    orderColumnHelper.accessor((row) => row.buyerPoNo ?? "--", {
      id: "buyerPoNo",
      header: "PO",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => {
        const val = getValue()
        return val === "--" ? (
          <span className="text-muted-foreground">--</span>
        ) : (
          <span className="font-mono font-medium">{val}</span>
        )
      },
    }),
    orderColumnHelper.accessor((row) => row.client?.name ?? "--", {
      id: "client",
      header: "Khách hàng",
      meta: { headerClassName: "min-w-44" },
    }),
    orderColumnHelper.accessor("orderDate", {
      header: "Ngày đặt hàng",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => <DateCell value={getValue()} />,
    }),
    orderColumnHelper.accessor("dueDate", {
      header: "Ngày giao hàng",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => <DueDateCell order={row.original} />,
    }),
    orderColumnHelper.accessor("totalVnd", {
      header: "Tổng giá trị (VND)",
      meta: {
        headerClassName: "min-w-36 text-right",
        cellClassName: "text-right tabular-nums whitespace-nowrap",
      },
      cell: ({ getValue }) => <MoneyCell value={getValue()} />,
    }),
    orderColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "min-w-32 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => <OrderStatusBadge tone={getValue()} />,
    }),
    orderColumnHelper.accessor("paymentTerm", {
      header: "Điều khoản TT",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => {
        const paymentTerm = getValue()
        return (
          <span className="text-muted-foreground">
            {paymentTerm ? paymentTermShortLabels[paymentTerm] : "—"}
          </span>
        )
      },
    }),
    orderColumnHelper.accessor((row) => row.assignedUser?.fullName ?? "—", {
      id: "assignedUser",
      header: "NV kinh doanh",
      meta: { headerClassName: "min-w-32" },
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    }),
    orderColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "min-w-24 text-center",
        cellClassName: "font-normal",
      },
      cell: ({ row }) => <OrderActionsCell order={row.original} />,
    }),
  ])
}

export const orderColumns = buildOrderColumns()
