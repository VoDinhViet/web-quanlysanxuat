import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { InventoryIssueStatusBadge } from "@/features/inventory-issues/components/primitives/InventoryIssueBadges"
import {
  InventoryIssueActionsCell,
  InventoryIssueJobLsxCell,
} from "@/features/inventory-issues/components/primitives/InventoryIssueTableCells"
import type { InventoryIssue } from "@/lib/types/inventory-issue.type"
import { inventoryIssueTypeLabels } from "@/lib/types/inventory-issue.type"

const col = createColumnHelper<typeof appTableFeatures, InventoryIssue>()

export const inventoryIssuesColumns = col.columns([
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
    header: "Mã phiếu xuất",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/inventory-issues/$issueId"
        params={{ issueId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.display({
    id: "requisition",
    header: "Phiếu lãnh",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => {
      const requisition = row.original.requisition
      if (!requisition) {
        return <span className="text-muted-foreground">—</span>
      }
      return (
        <Link
          to="/manage/inventory-requisitions/$requisitionId"
          params={{ requisitionId: requisition.id }}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {requisition.code}
        </Link>
      )
    },
  }),

  col.accessor("issueDate", {
    header: "Thời gian xuất",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    // `issueDate` là cột `date` thuần (không có giờ) — đọc theo zone "utc" để tránh lùi/lên
    // một ngày do offset múi giờ cục bộ, cùng cách InventoryReceiptsTableColumns đọc receiptDate.
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue(), { zone: "utc" }).toFormat("dd/MM/yyyy"),
  }),

  col.accessor("issueType", {
    header: "Loại xuất",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => inventoryIssueTypeLabels[getValue()],
  }),

  col.accessor("department", {
    header: "Bộ phận",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => getValue()?.name ?? "—",
  }),

  col.accessor("poOrReason", {
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),

  col.display({
    id: "jobAndOrder",
    header: "Job / LSX",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <InventoryIssueJobLsxCell
        productionOrder={row.original.productionOrder}
        productionJob={row.original.productionJob}
      />
    ),
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <InventoryIssueStatusBadge status={getValue()} />,
  }),

  col.accessor("creatorBy", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue()?.fullName ?? "—",
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <InventoryIssueActionsCell issue={row.original} />,
  }),
])
