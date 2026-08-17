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

  outsourcingReceiptColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-48" },
    cell: ({ row }) => {
      const item = row.original.item

      return (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {item.name}
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {item.code}
          </p>
        </div>
      )
    },
  }),

  outsourcingReceiptColumnHelper.accessor((row) => row.outsourcingOrder.code, {
    id: "outsourcingOrder",
    header: "Mã OS-OUT",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {getValue()}
      </span>
    ),
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
    cell: ({ row }) => (
      <span className="font-semibold text-foreground tabular-nums">
        {quantityFormatter.format(row.original.quantity)}{" "}
        <span className="font-normal text-muted-foreground">
          {row.original.item.unit.name}
        </span>
      </span>
    ),
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

  outsourcingReceiptColumnHelper.accessor("status", {
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
