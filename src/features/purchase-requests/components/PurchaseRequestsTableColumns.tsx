import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { PurchaseRequestStatusBadge } from "@/features/purchase-requests/components/PurchaseRequestBadges"
import {
  PurchaseRequestActionsCell,
  PurchaseRequestSourceCell,
} from "@/features/purchase-requests/components/PurchaseRequestTableCells"
import type { PurchaseRequest } from "@/lib/types/purchase-request.type"

const purchaseRequestColumnHelper = createColumnHelper<PurchaseRequest>()

export const purchaseRequestColumns = [
  purchaseRequestColumnHelper.accessor("code", {
    header: "Mã phiếu",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),
  purchaseRequestColumnHelper.accessor("createdAt", {
    header: "Ngày tạo",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  purchaseRequestColumnHelper.accessor("neededDate", {
    header: "Ngày cần",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),
  purchaseRequestColumnHelper.accessor(
    (row) => row.requester?.fullName ?? "—",
    {
      id: "requester",
      header: "Người đề xuất",
      meta: { headerClassName: "min-w-32" },
    }
  ),
  purchaseRequestColumnHelper.accessor((row) => row.department.name, {
    id: "department",
    header: "Bộ phận",
    meta: { headerClassName: "min-w-32" },
  }),
  purchaseRequestColumnHelper.display({
    id: "source",
    header: "PO liên quan / Lý do",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <PurchaseRequestSourceCell
        productionOrder={row.original.productionOrder}
      />
    ),
  }),
  purchaseRequestColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <PurchaseRequestStatusBadge status={getValue()} />,
  }),
  purchaseRequestColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: () => <PurchaseRequestActionsCell />,
  }),
]
