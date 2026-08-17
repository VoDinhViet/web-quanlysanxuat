import { createColumnHelper } from "@tanstack/react-table"

import type { OutsourcingOrderItem } from "@/lib/types/outsourcing-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")
const decimalFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
})

const itemColumnHelper = createColumnHelper<OutsourcingOrderItem>()

// Bảng chi tiết chỉ đọc của trang chi tiết OS-OUT — không có ở OS-IN (mỗi phiếu OS-IN chỉ 1 dòng
// vật tư), cùng idiom createOutsourcingOrderConfirmColumns.tsx (hằng module scope, không phải
// hàm build...).
export const outsourcingOrderItemsColumns = [
  itemColumnHelper.display({
    id: "index",
    header: "STT",
    meta: { headerClassName: "w-10", cellClassName: "text-muted-foreground" },
    cell: ({ row }) => row.index + 1,
  }),
  itemColumnHelper.display({
    id: "job",
    header: "Job",
    meta: {
      headerClassName: "w-24",
      cellClassName: "truncate font-mono text-xs text-muted-foreground",
    },
    cell: ({ row }) => row.original.productionJob?.code ?? "—",
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
    header: "SL gửi",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  itemColumnHelper.accessor("receivedQuantity", {
    header: "SL đã nhận",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => quantityFormatter.format(getValue()),
  }),
  itemColumnHelper.display({
    id: "remaining",
    header: "Còn lại",
    meta: {
      headerClassName: "w-20 text-right",
      cellClassName: "text-right font-semibold tabular-nums",
    },
    cell: ({ row }) =>
      quantityFormatter.format(
        row.original.quantity - row.original.receivedQuantity
      ),
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
