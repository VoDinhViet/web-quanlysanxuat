import { createColumnHelper } from "@tanstack/react-table"

import { OrderStatusBadge } from "@/features/orders/components/OrderBadges"
import {
  DateCell,
  DueDateCell,
  MoneyCell,
  OrderActionsCell,
} from "@/features/orders/components/OrderTableCells"
import { paymentTermLabels } from "@/lib/types/order.type"
import type { Order } from "@/lib/types/order.type"

const MONEY_COLUMN_META = {
  headerClassName: "min-w-36 text-right",
  cellClassName: "text-right tabular-nums whitespace-nowrap",
}

const orderColumnHelper = createColumnHelper<Order>()

export const orderColumns = [
  orderColumnHelper.accessor("code", {
    header: "Mã đơn hàng",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  orderColumnHelper.accessor((row) => row.client.name, {
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
    meta: MONEY_COLUMN_META,
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
          {paymentTerm ? paymentTermLabels[paymentTerm] : "—"}
        </span>
      )
    },
  }),
  orderColumnHelper.accessor((row) => row.staff?.fullName ?? "—", {
    id: "salesRep",
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
]
