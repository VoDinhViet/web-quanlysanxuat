import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionBadges"
import {
  InventoryRequisitionActionsCell,
  InventoryRequisitionSourceCell,
} from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionTableCells"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"

const col = createColumnHelper<InventoryRequisition>()

export const inventoryRequisitionsColumns = [
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.accessor("code", {
    header: "Mã phiếu lãnh",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/inventory-requisitions/$requisitionId"
        params={{ requisitionId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.accessor("requisitionDate", {
    header: "Ngày lãnh",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),

  col.display({
    id: "source",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-36" },
    cell: ({ row }) => (
      <InventoryRequisitionSourceCell
        productionOrder={row.original.productionOrder}
        reason={row.original.reason}
      />
    ),
  }),

  col.accessor("productionJob", {
    header: "Job",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-foreground">
        {getValue()?.code ?? "—"}
      </span>
    ),
  }),

  col.accessor("department", {
    header: "Bộ phận",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => getValue()?.name ?? "—",
  }),

  col.accessor("creatorBy", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue()?.fullName ?? "—",
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <InventoryRequisitionStatusBadge status={getValue()} />
    ),
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-40 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <InventoryRequisitionActionsCell requisition={row.original} />
    ),
  }),
]
