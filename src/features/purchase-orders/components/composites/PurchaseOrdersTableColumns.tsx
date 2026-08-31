import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { PurchaseOrderProgressBadge } from "@/features/purchase-orders/components/primitives/PurchaseOrderBadges"
import {
  PurchaseOrderActionsCell,
  PurchaseOrderAmountCell,
  PurchaseOrderSourceCell,
} from "@/features/purchase-orders/components/primitives/PurchaseOrderTableCells"
import type { PurchaseOrder } from "@/lib/types/purchase-order.type"

const purchaseOrderColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseOrder
>()

export const purchaseOrdersColumns = purchaseOrderColumnHelper.columns([
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
    id: "quotation",
    header: "RFQ nguồn",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => {
      const quotation = row.original.quotation
      if (!quotation) {
        return <span className="text-xs text-muted-foreground">—</span>
      }
      return (
        <Link
          to="/manage/purchase-quotations/$purchaseQuotationId"
          params={{ purchaseQuotationId: quotation.id }}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {quotation.code}
        </Link>
      )
    },
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

  purchaseOrderColumnHelper.accessor(
    (row) => row.assignedUser?.fullName ?? "—",
    {
      id: "assignedUser",
      header: "Người phụ trách",
      meta: { headerClassName: "min-w-32" },
    }
  ),

  purchaseOrderColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <PurchaseOrderActionsCell purchaseOrderId={row.original.id} />
    ),
  }),
])
