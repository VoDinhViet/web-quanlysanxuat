import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { OutsourcingOrderStatusBadge } from "@/features/outsourcing-orders/components/OutsourcingOrderBadges"
import { OutsourcingOrderActionsCell } from "@/features/outsourcing-orders/components/OutsourcingOrdersTableCells"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"

const col = createColumnHelper<OutsourcingOrder>()

export const outsourcingOrdersColumns = [
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-11 min-w-11 text-center",
      cellClassName: "text-center text-muted-foreground font-mono text-xs",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.accessor("code", {
    header: "Mã phiếu",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/outsourcing-orders/$outsourcingOrderId"
        params={{ outsourcingOrderId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.accessor("createdAt", {
    header: "Ngày lập",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  col.accessor("sentDate", {
    header: "Ngày gửi",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  col.accessor("supplierName", {
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-36" },
  }),

  col.accessor("operationName", {
    header: "Công đoạn",
    meta: { headerClassName: "min-w-32" },
  }),

  col.accessor("totalQuantity", {
    header: "Tổng SL gửi",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-xs",
    },
    cell: ({ getValue, row }) => `${getValue()} ${row.original.unit}`,
  }),

  col.accessor("receivedQuantity", {
    header: "Đã nhận",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-xs",
    },
  }),

  col.display({
    id: "remaining",
    header: "Còn lại",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-xs font-semibold",
    },
    cell: ({ row }) =>
      row.original.totalQuantity - row.original.receivedQuantity,
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OutsourcingOrderStatusBadge status={getValue()} />,
  }),

  col.accessor("expectedReturnDate", {
    header: "Ngày hẹn về",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value ? DateTime.fromISO(value).toFormat("dd/MM/yyyy") : "—"
    },
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center font-normal",
    },
    cell: ({ row }) => (
      <OutsourcingOrderActionsCell outsourcingOrder={row.original} />
    ),
  }),
]
