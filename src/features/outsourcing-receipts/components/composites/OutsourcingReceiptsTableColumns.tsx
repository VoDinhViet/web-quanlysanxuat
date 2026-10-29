import { createColumnHelper } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import type { appTableFeatures } from "@/lib/table-features"

import { Badge } from "@/components/ui/badge"
import { OutsourcingReceiptDocStatusBadge } from "@/features/outsourcing-receipts/components/primitives/OutsourcingReceiptBadges"
import { OutsourcingReceiptActionsCell } from "@/features/outsourcing-receipts/components/primitives/OutsourcingReceiptTableCells"
import { vnZone } from "@/lib/time"
import type { OutsourcingReceipt } from "@/lib/types/outsourcing-receipt.type"

const outsourcingReceiptColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  OutsourcingReceipt
>()

export const outsourcingReceiptsColumns =
  outsourcingReceiptColumnHelper.columns([
    outsourcingReceiptColumnHelper.accessor("code", {
      header: "Mã OS-IN",
      meta: { headerClassName: "min-w-28" },
      cell: ({ getValue }) => (
        <span className="font-mono font-medium text-primary">{getValue()}</span>
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

    outsourcingReceiptColumnHelper.accessor("totalQuantity", {
      header: "SL nhận",
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums",
      },
    }),

    outsourcingReceiptColumnHelper.accessor("requiresIqc", {
      header: "Yêu cầu QC",
      meta: {
        headerClassName: "min-w-24 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge variant="outline" className="bg-info-soft text-info-ink">
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
        <OutsourcingReceiptDocStatusBadge status={getValue()} />
      ),
    }),

    outsourcingReceiptColumnHelper.accessor("receiptDate", {
      header: "Ngày nhận",
      meta: {
        headerClassName: "min-w-28 text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) =>
        format(parseISO(getValue(), { in: vnZone }), "dd/MM/yyyy"),
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
  ])
