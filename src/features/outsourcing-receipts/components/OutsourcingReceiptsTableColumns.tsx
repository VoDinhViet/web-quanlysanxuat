import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { OutsourcingReceiptStatusBadge } from "@/features/outsourcing-receipts/components/OutsourcingReceiptBadges"
import { OutsourcingReceiptActionsCell } from "@/features/outsourcing-receipts/components/OutsourcingReceiptsTableCells"
import type { OutsourcingReceipt } from "@/lib/types/outsourcing-receipt.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const outsourcingReceiptColumnHelper = createColumnHelper<OutsourcingReceipt>()

export const outsourcingReceiptsColumns = [
  outsourcingReceiptColumnHelper.accessor("code", {
    header: "Mã OS-IN",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  // Một phiếu có thể gộp nhiều dòng OS-OUT khác nhau (cùng NCC) — nối tên vật tư distinct ngay
  // tại cell, không qua field trung gian nào (xem outsourcing-receipt.type.ts's OutsourcingReceipt
  // comment).
  outsourcingReceiptColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-48" },
    cell: ({ row }) => {
      const itemNames = Array.from(
        new Set(row.original.items.map((item) => item.item.name))
      ).join(", ")

      return (
        <p className="truncate text-xs font-semibold text-foreground">
          {itemNames || "—"}
        </p>
      )
    },
  }),

  outsourcingReceiptColumnHelper.display({
    id: "outsourcingOrder",
    header: "Mã OS-OUT",
    meta: { headerClassName: "min-w-28" },
    cell: ({ row }) => {
      const orders = Array.from(
        new Map(
          row.original.items.map((item) => [
            item.outsourcingOrder.id,
            item.outsourcingOrder,
          ])
        ).values()
      )

      if (orders.length === 0) return "—"
      if (orders.length === 1) {
        const order = orders[0]
        return (
          <Link
            to="/manage/outsourcing-orders/$outsourcingOrderId"
            params={{ outsourcingOrderId: order.id }}
            className="font-mono text-xs text-primary hover:underline"
          >
            {order.code}
          </Link>
        )
      }
      return (
        <span className="text-xs text-muted-foreground">
          {orders.map((order) => order.code).join(", ")}
        </span>
      )
    },
  }),

  outsourcingReceiptColumnHelper.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => (
      <span className="block max-w-40 truncate">{getValue()}</span>
    ),
  }),

  outsourcingReceiptColumnHelper.display({
    id: "quantity",
    header: "SL nhận",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right",
    },
    cell: ({ row }) => {
      const unitCodes = new Set(
        row.original.items.map((item) => item.item.unit.code)
      )
      const unitName =
        unitCodes.size === 1
          ? (row.original.items[0]?.item.unit.name ?? "")
          : ""

      return (
        <span className="font-semibold text-foreground tabular-nums">
          {quantityFormatter.format(row.original.totalQuantity)}{" "}
          <span className="font-normal text-muted-foreground">
            {unitName || "—"}
          </span>
        </span>
      )
    },
  }),

  outsourcingReceiptColumnHelper.accessor((row) => row.warehouse.name, {
    id: "warehouse",
    header: "Kho nhận",
    meta: { headerClassName: "min-w-32" },
  }),

  outsourcingReceiptColumnHelper.accessor("requiresIqc", {
    header: "Yêu cầu QC",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
        >
          Có
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">Không</span>
      ),
  }),

  outsourcingReceiptColumnHelper.accessor("progress", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <OutsourcingReceiptStatusBadge status={getValue()} />
    ),
  }),

  outsourcingReceiptColumnHelper.accessor("receiptDate", {
    header: "Ngày nhận",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  outsourcingReceiptColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <OutsourcingReceiptActionsCell outsourcingReceipt={row.original} />
    ),
  }),
]
