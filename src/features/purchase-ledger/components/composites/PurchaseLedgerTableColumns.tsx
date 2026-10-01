import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { PurchaseLedgerStatusBadge } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerBadges"
import {
  PurchaseLedgerActionsCell,
  PurchaseLedgerProgressCell,
  PurchaseLedgerWarningCell,
} from "@/features/purchase-ledger/components/primitives/PurchaseLedgerTableCells"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const purchaseLedgerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseLedgerRow
>()

export const purchaseLedgerColumns = purchaseLedgerColumnHelper.columns([
  purchaseLedgerColumnHelper.display({
    id: "requestSource",
    header: "Đề xuất / Nguồn",
    meta: {
      headerClassName: "min-w-32 max-w-40",
    },
    cell: ({ row }) => {
      const prCode = row.original.purchaseRequest.code
      const po = row.original.productionOrder
      const note = row.original.note

      return (
        <div className="flex min-w-0 flex-col py-0.5">
          <span className="font-mono text-xs font-semibold text-primary">
            {prCode}
          </span>
          <div
            className="truncate text-[11px] text-muted-foreground"
            title={po?.code ? `PO: ${po.code}` : note ?? undefined}
          >
            {po ? (
              po.code ? (
                <span className="font-mono text-muted-foreground">
                  PO: {po.code}
                </span>
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )
            ) : (
              <span>{note ?? "—"}</span>
            )}
          </div>
        </div>
      )
    },
  }),

  purchaseLedgerColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-44 max-w-64" },
    cell: ({ row }) => {
      const { item, unit } = row.original
      return (
        <div className="min-w-0 py-0.5">
          <p
            className="truncate text-xs font-medium text-foreground"
            title={item.name}
          >
            {item.name}
          </p>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary">{item.code}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-sans text-muted-foreground">{unit.name}</span>
          </div>
        </div>
      )
    },
  }),

  purchaseLedgerColumnHelper.display({
    id: "fulfillment",
    header: "Số lượng",
    meta: {
      headerClassName: "w-32 min-w-28",
    },
    cell: ({ row }) => (
      <PurchaseLedgerProgressCell
        quantity={row.original.quantity}
        orderedQuantity={row.original.orderedQuantity}
        receivedQuantity={row.original.receivedQuantity}
        unitName={row.original.unit.name}
      />
    ),
  }),

  purchaseLedgerColumnHelper.display({
    id: "dates",
    header: "Thời gian",
    meta: {
      headerClassName: "w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => {
      const neededDate = DateTime.fromISO(row.original.neededDate).toFormat(
        "dd/MM/yyyy"
      )
      const createdAt = DateTime.fromISO(row.original.createdAt).toFormat(
        "dd/MM/yyyy"
      )

      return (
        <div className="flex flex-col items-center py-0.5">
          <span
            className="text-xs font-semibold text-foreground"
            title="Ngày cần hàng"
          >
            {neededDate}
          </span>
          <span
            className="text-[11px] text-muted-foreground"
            title="Ngày tạo đề xuất"
          >
            Tạo: {createdAt}
          </span>
        </div>
      )
    },
  }),

  purchaseLedgerColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <PurchaseLedgerStatusBadge status={getValue()} />,
  }),

  purchaseLedgerColumnHelper.accessor("warnings", {
    header: "Cảnh báo",
    meta: {
      headerClassName: "w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <PurchaseLedgerWarningCell warnings={getValue()} />,
  }),

  purchaseLedgerColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "w-16 text-center",
      cellClassName: "text-center font-normal",
    },
    cell: () => <PurchaseLedgerActionsCell />,
  }),
])
