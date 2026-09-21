import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Badge } from "@/components/ui/badge"
import { InventoryRequisitionStatusBadge } from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionBadges"
import {
  InventoryRequisitionActionsCell,
  InventoryRequisitionSourceCell,
} from "@/features/inventory-requisitions/components/primitives/InventoryRequisitionTableCells"
import { InventoryRequisitionType } from "@/lib/types/inventory-requisition.type"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"

const col = createColumnHelper<typeof appTableFeatures, InventoryRequisition>()

export const inventoryRequisitionsColumns = col.columns([
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
    header: "Mã phiếu",
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
    header: "Ngày",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),

  col.accessor("creatorBy", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue()?.fullName ?? "—",
  }),

  col.accessor("department", {
    header: "Bộ phận",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => getValue()?.name ?? "—",
  }),

  col.accessor("type", {
    header: "Loại",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => {
      const isProduction = getValue() === InventoryRequisitionType.PRODUCTION
      return (
        <Badge
          variant="outline"
          className={cn(
            "whitespace-nowrap",
            isProduction
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isProduction ? "Lãnh từ LSX" : "Lãnh khác"}
        </Badge>
      )
    },
  }),

  col.display({
    id: "jobAndOrder",
    header: "Job / LSX",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => {
      const jobCode = row.original.productionJob?.code
      const lsxCode = row.original.productionOrder?.code
      if (!jobCode && !lsxCode) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <div className="flex flex-col gap-0.5 font-mono text-xs">
          {jobCode ? (
            <span className="font-semibold text-foreground">{jobCode}</span>
          ) : null}
          {lsxCode ? (
            <span className="text-[11px] text-muted-foreground">{lsxCode}</span>
          ) : null}
        </div>
      )
    },
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
])
