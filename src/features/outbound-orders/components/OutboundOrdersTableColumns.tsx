import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { OutboundOrderStatusBadge } from "@/features/outbound-orders/components/OutboundOrderBadges"
import { OutboundOrderActionsCell } from "@/features/outbound-orders/components/OutboundOrderTableCells"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"
import { fulfillmentTypeLabels } from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

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
        search={{ mode: "view" }}
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

  col.accessor((row) => row.client.name, {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-36" },
  }),

  col.accessor("orderCodes", {
    id: "poOrReason",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => {
      const orderCodes = getValue()
      return orderCodes.length > 0 ? orderCodes.join(", ") : "—"
    },
  }),

  col.accessor("fulfillmentType", {
    header: "Hình thức giao",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => fulfillmentTypeLabels[getValue()],
  }),

  col.accessor("totalQuantity", {
    header: "Tổng SL giao",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right text-xs",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
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
