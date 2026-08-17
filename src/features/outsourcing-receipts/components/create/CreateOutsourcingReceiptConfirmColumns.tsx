import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"

import type { CreateOutsourcingReceiptItemValue } from "@/features/outsourcing-receipts/schemas/create-outsourcing-receipt.schema"

const confirmColumnHelper =
  createColumnHelper<CreateOutsourcingReceiptItemValue>()

// Bảng chi tiết chỉ đọc của bước ③ — không có tham số như 2 file *Columns.tsx còn lại trong wizard
// (item/picker), nên là một hằng module scope, cùng idiom CreateOutsourcingOrderConfirmColumns.tsx.
export const createOutsourcingReceiptConfirmColumns = [
  confirmColumnHelper.display({
    id: "index",
    header: "STT",
    meta: { headerClassName: "w-10", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.index + 1,
  }),
  confirmColumnHelper.accessor("outsourcingOrderCode", {
    header: "OS-OUT",
    meta: { headerClassName: "w-24" },
    cell: ({ getValue, row }) => (
      <Link
        to="/manage/outsourcing-orders/$outsourcingOrderId"
        params={{ outsourcingOrderId: row.original.outsourcingOrderId }}
        className="truncate font-mono text-xs text-primary hover:underline"
      >
        {getValue()}
      </Link>
    ),
  }),
  confirmColumnHelper.display({
    id: "item",
    header: "Chi tiết",
    meta: { headerClassName: "w-44" },
    cell: ({ row }) => (
      <div>
        <p className="truncate font-medium text-foreground">
          {row.original.itemName}
        </p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {row.original.itemCode}
        </p>
      </div>
    ),
  }),
  confirmColumnHelper.accessor("operationName", {
    header: "Công đoạn",
    meta: {
      headerClassName: "w-32",
      cellClassName: "truncate text-muted-foreground",
    },
  }),
  confirmColumnHelper.accessor("unitName", {
    header: "ĐVT",
    meta: { headerClassName: "w-14", cellClassName: "text-muted-foreground" },
  }),
  confirmColumnHelper.accessor("quantity", {
    header: "SL nhận",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
  }),
  confirmColumnHelper.accessor("weight", {
    header: "Trọng lượng (kg)",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => getValue() || "—",
  }),
  confirmColumnHelper.accessor("area", {
    header: "Diện tích (m²)",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => getValue() || "—",
  }),
  confirmColumnHelper.accessor("note", {
    header: "Ghi chú",
    meta: {
      headerClassName: "w-40",
      cellClassName: "truncate text-muted-foreground",
    },
    cell: ({ getValue }) => getValue() || "—",
  }),
]
