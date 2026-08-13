import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import {
  AssetTypeBadge,
  InventoryReceiptStatusBadge,
} from "@/features/inventory-receipts/components/InventoryReceiptBadges"
import { InventoryReceiptActionsCell } from "@/features/inventory-receipts/components/InventoryReceiptsTableCells"
import type { InventoryReceipt } from "@/lib/types/inventory-receipt.type"
import { inventoryReceiptSourceLabels } from "@/lib/types/inventory-receipt.type"

const col = createColumnHelper<InventoryReceipt>()

export const inventoryReceiptsColumns = [
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
    header: "Mã phiếu nhập",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/inventory-receipts/$inventoryReceiptId"
        params={{ inventoryReceiptId: row.original.id }}
        className="font-mono text-xs font-semibold text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),

  col.accessor("receiptDate", {
    header: "Ngày nhập",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy HH:mm"),
  }),

  col.accessor("source", {
    header: "Nguồn nhập",
    meta: { headerClassName: "min-w-40" },
    cell: ({ getValue }) => inventoryReceiptSourceLabels[getValue()],
  }),

  col.accessor("poOrReason", {
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-48" },
  }),

  col.accessor("assetType", {
    header: "Loại tài sản",
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <AssetTypeBadge type={getValue()} />,
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <InventoryReceiptStatusBadge status={getValue()} />
    ),
  }),

  col.accessor("createdByName", {
    header: "Người tạo",
    meta: { headerClassName: "min-w-32" },
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <InventoryReceiptActionsCell receipt={row.original} />,
  }),
]
