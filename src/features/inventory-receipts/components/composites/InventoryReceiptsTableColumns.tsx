import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { InventoryReceiptStatusBadge } from "@/features/inventory-receipts/components/primitives/InventoryReceiptBadges"
import {
  InventoryReceiptActionsCell,
  InventoryReceiptSourceCell,
} from "@/features/inventory-receipts/components/primitives/InventoryReceiptTableCells"
import type { InventoryReceipt } from "@/lib/types/inventory-receipt.type"
import { inventoryReceiptTypeLabels } from "@/lib/types/inventory-receipt.type"

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
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    // `receiptDate` là cột `date` thuần (không có giờ) — đọc theo zone "utc" để tránh lùi/lên
    // một ngày do offset múi giờ cục bộ, cùng cách UpdateOrderForm.tsx đọc orderDate/dueDate.
    cell: ({ getValue }) =>
      DateTime.fromISO(getValue(), { zone: "utc" }).toFormat("dd/MM/yyyy"),
  }),

  col.accessor("receiptType", {
    header: "Loại phiếu",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => inventoryReceiptTypeLabels[getValue()],
  }),

  col.accessor("warehouse", {
    header: "Kho",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue().name,
  }),

  col.display({
    id: "source",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-40" },
    cell: ({ row }) => (
      <InventoryReceiptSourceCell
        purchaseOrder={row.original.purchaseOrder}
        supplier={row.original.supplier}
        client={row.original.client}
        purchaseRequest={row.original.purchaseRequest}
        productionOrder={row.original.productionOrder}
      />
    ),
  }),

  col.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <InventoryReceiptStatusBadge status={getValue()} />,
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
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => <InventoryReceiptActionsCell receipt={row.original} />,
  }),
]
