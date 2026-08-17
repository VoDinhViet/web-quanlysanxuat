import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"

import type { OutsourcingReceiptItem } from "@/lib/types/outsourcing-receipt.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

const itemColumnHelper = createColumnHelper<OutsourcingReceiptItem>()

// Bảng chi tiết chỉ đọc của trang chi tiết OS-IN — cùng idiom outsourcingOrderItemsColumns.tsx,
// cộng cột "OS-OUT" (link) vì ở đây mỗi dòng có thể trỏ tới một OS-OUT khác nhau (khác OS-OUT nơi
// mọi dòng cùng 1 phiếu nên không cần cột này).
export const outsourcingReceiptItemsColumns = [
  itemColumnHelper.display({
    id: "index",
    header: "STT",
    meta: { headerClassName: "w-10", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.index + 1,
  }),
  itemColumnHelper.display({
    id: "outsourcingOrder",
    header: "OS-OUT",
    meta: {
      headerClassName: "w-24",
      cellClassName: "font-mono text-xs",
    },
    cell: ({ row }) => (
      <Link
        to="/manage/outsourcing-orders/$outsourcingOrderId"
        params={{ outsourcingOrderId: row.original.outsourcingOrder.id }}
        className="text-primary hover:underline"
      >
        {row.original.outsourcingOrder.code}
      </Link>
    ),
  }),
  itemColumnHelper.display({
    id: "item",
    header: "Chi tiết",
    meta: { headerClassName: "w-44" },
    cell: ({ row }) => (
      <div>
        <p className="truncate font-medium text-foreground">
          {row.original.item.name}
        </p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">
          {row.original.item.code}
        </p>
      </div>
    ),
  }),
  itemColumnHelper.accessor("operationName", {
    header: "Công đoạn",
    meta: {
      headerClassName: "w-32",
      cellClassName: "truncate text-muted-foreground",
    },
  }),
  itemColumnHelper.display({
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "w-14", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.original.item.unit.name,
  }),
  itemColumnHelper.accessor("quantity", {
    header: "SL nhận",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  itemColumnHelper.accessor("weight", {
    header: "Trọng lượng (kg)",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value === null ? "—" : decimalFormatter.format(value)
    },
  }),
  itemColumnHelper.accessor("area", {
    header: "Diện tích (m²)",
    meta: {
      headerClassName: "w-28 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => {
      const value = getValue()
      return value === null ? "—" : decimalFormatter.format(value)
    },
  }),
  itemColumnHelper.accessor("note", {
    header: "Ghi chú",
    meta: {
      headerClassName: "w-40",
      cellClassName: "truncate text-muted-foreground",
    },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
]
