import { createColumnHelper } from "@tanstack/react-table"

import type { CreateOutsourcingOrderItemValue } from "@/features/outsourcing-orders/schemas/create-outsourcing-order.schema"

const confirmColumnHelper =
  createColumnHelper<CreateOutsourcingOrderItemValue>()

// Bảng chi tiết chỉ đọc của bước ③ — không có tham số như 2 file *Columns.tsx còn lại trong
// wizard (item/picker), nên là một hằng module scope thay vì hàm build..., cùng idiom itemColumns
// trong InventoryReceiptItemsSection.tsx.
export const createOutsourcingOrderConfirmColumns = [
  confirmColumnHelper.display({
    id: "index",
    header: "STT",
    meta: { headerClassName: "w-10", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.index + 1,
  }),
  confirmColumnHelper.accessor("productionJobCode", {
    header: "Job",
    meta: {
      headerClassName: "w-24",
      cellClassName: "truncate font-mono text-xs text-muted-foreground",
    },
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
    header: "SL gửi",
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
    cell: ({ getValue }) => getValue() ?? "—",
  }),
  confirmColumnHelper.accessor("area", {
    header: "Diện tích (m²)",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => getValue() ?? "—",
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
