import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import type { appTableFeatures } from "@/lib/table-features"

import {
  OutboundOrderInvoiceStatusBadge,
  OutboundOrderStatusBadge,
} from "@/features/outbound-orders/components/primitives/OutboundOrderBadges"
import { OutboundOrderActionsCell } from "@/features/outbound-orders/components/primitives/OutboundOrderTableCells"
import { vnZone } from "@/lib/time"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"
import {
  OutboundOrderStatus,
  fulfillmentTypeLabels,
} from "@/lib/types/outbound-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const col = createColumnHelper<typeof appTableFeatures, OutboundOrder>()

export const outboundOrdersColumns = col.columns([
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
        className="font-mono text-xs font-medium text-primary hover:underline"
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
      format(parseISO(getValue(), { in: vnZone }), "dd/MM/yyyy HH:mm"),
  }),

  col.accessor((row) => row.client.name, {
    id: "client",
    header: "Khách hàng",
    meta: { headerClassName: "min-w-36" },
  }),

  // Số PO của khách — mảng (1 DO gộp nhiều đơn) nên cắt bằng `truncate`, danh sách đầy đủ nằm ở tooltip.
  col.accessor((row) => row.buyerPoNos.join(", "), {
    id: "poOrReason",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => {
      const buyerPoNos = getValue()

      return (
        <span className="block max-w-56 truncate text-xs" title={buyerPoNos}>
          {buyerPoNos || "—"}
        </span>
      )
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

  // DO chưa giao chưa có hóa đơn để nhập nên chỉ hiện huy hiệu khi đã giao; còn lại để "—".
  col.accessor("invoiceStatus", {
    header: "Hóa đơn",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue, row }) =>
      row.original.status === OutboundOrderStatus.DELIVERED ? (
        <OutboundOrderInvoiceStatusBadge invoiceStatus={getValue()} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  }),

  col.accessor("invoiceNo", {
    header: "Số hóa đơn",
    meta: { headerClassName: "min-w-32", cellClassName: "font-mono text-xs" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),

  col.accessor("invoiceDate", {
    header: "Ngày hóa đơn",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center text-xs",
    },
    cell: ({ getValue }) => {
      const invoiceDate = getValue()

      return invoiceDate
        ? format(parseISO(invoiceDate, { in: vnZone }), "dd/MM/yyyy")
        : "—"
    },
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
])
