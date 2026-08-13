import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { OutboundOrderStatusBadge } from "@/features/outbound-orders/components/OutboundOrderBadges"
import { OutboundOrderActionsCell } from "@/features/outbound-orders/components/OutboundOrdersTableCells"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"
import { outboundDeliveryMethodLabels } from "@/lib/types/outbound-order.type"

const col = createColumnHelper<OutboundOrder>()

export const outboundOrdersColumns = [
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
    header: "Mã DO",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/outbound-orders/$outboundOrderId"
        params={{ outboundOrderId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.accessor("createdAt", {
    header: "Ngày tạo",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),

  col.accessor("clientName", {
    header: "Khách hàng",
    meta: { headerClassName: "min-w-36" },
  }),

  col.accessor("poOrReason", {
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-44" },
  }),

  col.accessor("deliveryMethod", {
    header: "Hình thức giao",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => outboundDeliveryMethodLabels[getValue()],
  }),

  col.accessor("totalQuantity", {
    header: "Tổng SL giao",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums font-semibold text-xs",
    },
    cell: ({ getValue, row }) => `${getValue()} ${row.original.unit}`,
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <OutboundOrderStatusBadge status={getValue()} />,
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center font-normal",
    },
    cell: ({ row }) => <OutboundOrderActionsCell order={row.original} />,
  }),
]
