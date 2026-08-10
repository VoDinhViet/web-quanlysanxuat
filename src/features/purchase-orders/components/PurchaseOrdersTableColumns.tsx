import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { PurchaseOrderProgressBadge } from "@/features/purchase-orders/components/PurchaseOrderBadges"
import {
  PurchaseOrderActionsCell,
  PurchaseOrderAmountCell,
  PurchaseOrderSourceCell,
} from "@/features/purchase-orders/components/PurchaseOrdersTableCells"
import type { PurchaseOrderRow } from "@/lib/types/purchase-order.type"

const purchaseOrderColumnHelper = createColumnHelper<PurchaseOrderRow>()

export const purchaseOrdersColumns = [
  purchaseOrderColumnHelper.accessor("code", {
    header: "Mã PO",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  purchaseOrderColumnHelper.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "NCC",
    meta: { headerClassName: "min-w-40" },
  }),

  purchaseOrderColumnHelper.display({
    id: "quotations",
    header: "RFQ nguồn",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => (
      <PurchaseOrderSourceCell
        codes={row.original.quotations.map((ref) => ref.code)}
      />
    ),
  }),

  purchaseOrderColumnHelper.display({
    id: "purchaseRequests",
    header: "PR nguồn",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => (
      <PurchaseOrderSourceCell
        codes={row.original.purchaseRequests.map((ref) => ref.code)}
      />
    ),
  }),

  purchaseOrderColumnHelper.accessor("orderDate", {
    header: "Ngày đặt",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  purchaseOrderColumnHelper.accessor("expectedDate", {
    header: "Ngày giao dự kiến",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value ? DateTime.fromISO(value).toFormat("dd/MM/yyyy") : "—"
    },
  }),

  purchaseOrderColumnHelper.accessor("totalAmount", {
    header: "Giá trị (VND)",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <PurchaseOrderAmountCell value={getValue()} />,
  }),

  purchaseOrderColumnHelper.accessor("progress", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <PurchaseOrderProgressBadge progress={getValue()} />
    ),
  }),

  purchaseOrderColumnHelper.accessor((row) => row.creator?.fullName ?? "—", {
    id: "creator",
    header: "Người phụ trách",
    meta: { headerClassName: "min-w-32" },
  }),

  purchaseOrderColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: () => <PurchaseOrderActionsCell />,
  }),
]
