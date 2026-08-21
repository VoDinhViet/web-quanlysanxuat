import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { MaterialIssueStatusBadge } from "@/features/material-issues/components/MaterialIssueBadges"
import {
  MaterialIssueActionsCell,
  MaterialIssueSourceCell,
} from "@/features/material-issues/components/MaterialIssuesTableCells"
import type { MaterialIssue } from "@/lib/types/material-issue.type"

const col = createColumnHelper<MaterialIssue>()

export const materialIssuesColumns = [
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
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  col.accessor("issueDate", {
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
      <MaterialIssueSourceCell
        productionOrderCode={row.original.productionOrderCode}
        reason={row.original.reason}
      />
    ),
  }),

  col.accessor("job", {
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
    cell: ({ getValue }) => getValue().name,
  }),

  col.accessor("creator", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue().fullName,
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <MaterialIssueStatusBadge status={getValue()} />,
  }),

  col.accessor("note", {
    header: "Ghi chú",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-40 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <MaterialIssueActionsCell issue={row.original} />,
  }),
]
