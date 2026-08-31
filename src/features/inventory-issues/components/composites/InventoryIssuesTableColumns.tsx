import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { InventoryIssueStatusBadge } from "@/features/inventory-issues/components/primitives/InventoryIssueBadges"
import {
  InventoryIssueActionsCell,
  InventoryIssueSourceCell,
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

  // No detail route exists yet — plain text, not a Link (unlike inventoryReceiptsColumns'
  // `code` cell, which links to `/manage/inventory-receipts/$inventoryReceiptId`).
  col.accessor("code", {
    header: "Mã phiếu xuất",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue()}</span>
    ),
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

  // Không có field PO trên phiếu xuất (chỉ phiếu nhập mới có) — hiển thị ghi chú tự do,
  // sẽ có dữ liệu phong phú hơn khi phiếu lãnh/DO-link được thêm ở backend.
  col.accessor("note", {
    header: "Lý do, PO",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),

  col.display({
    id: "source",
    header: "Đối tượng",
    meta: { headerClassName: "min-w-40" },
    cell: ({ row }) => (
      <InventoryIssueSourceCell
        productionOrder={row.original.productionOrder}
        productionJob={row.original.productionJob}
        department={row.original.department}
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
