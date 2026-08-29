import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { PaymentRequestStatusBadge } from "@/features/payment-requests/components/PaymentRequestBadges"
import {
  PaymentRequestActionsCell,
  PaymentRequestAmountCell,
} from "@/features/payment-requests/components/PaymentRequestTableCells"
import type { PaymentRequest } from "@/lib/types/payment-request.type"

const col = createColumnHelper<PaymentRequest>()

export const paymentRequestsColumns = [
  col.accessor("code", {
    header: "Mã yêu cầu TT",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/payment-requests/$paymentRequestId"
        params={{ paymentRequestId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.accessor((row) => row.purchaseOrder.code, {
    id: "purchaseOrder",
    header: "PO",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => (
      <Link
        to="/manage/purchase-orders/$purchaseOrderId"
        params={{ purchaseOrderId: row.original.purchaseOrder.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {row.original.purchaseOrder.code}
      </Link>
    ),
  }),

  col.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-40" },
  }),

  col.accessor((row) => row.purchaseOrder.orderDate, {
    id: "poDate",
    header: "Ngày PO",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  col.accessor("poValue", {
    header: "Giá trị PO (VND)",
    meta: {
      headerClassName: "min-w-36 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <PaymentRequestAmountCell value={getValue()} />,
  }),

  col.accessor("requestValue", {
    header: "Giá trị YCTT (VND)",
    meta: {
      headerClassName: "min-w-36 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <PaymentRequestAmountCell value={getValue()} />,
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <PaymentRequestStatusBadge status={getValue()} />,
  }),

  col.accessor("createdAt", {
    header: "Ngày tạo",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <PaymentRequestActionsCell paymentRequestId={row.original.id} />
    ),
  }),
]
