import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { PurchaseLedgerStatusBadge } from "@/features/purchase-ledger/components/PurchaseLedgerBadges"
import {
  PurchaseLedgerActionsCell,
  PurchaseLedgerQuantityCell,
  PurchaseLedgerSourceCell,
  PurchaseLedgerWarningCell,
} from "@/features/purchase-ledger/components/PurchaseLedgerTableCells"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const purchaseLedgerColumnHelper = createColumnHelper<PurchaseLedgerRow>()

// Shared by the 3 quantity columns — same idiom as OrdersTableColumns' moneyColumnMeta.
const quantityColumnMeta = {
  headerClassName: "min-w-24 text-right",
  cellClassName: "text-right",
}

export const purchaseLedgerColumns = [
  purchaseLedgerColumnHelper.accessor((row) => row.purchaseRequest.code, {
    id: "purchaseRequestCode",
    header: "Mã PR",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  purchaseLedgerColumnHelper.display({
    id: "source",
    header: "PO / Lý do",
    meta: { headerClassName: "min-w-36" },
    cell: ({ row }) => (
      <PurchaseLedgerSourceCell
        productionOrder={row.original.productionOrder}
        note={row.original.note}
      />
    ),
  }),

  purchaseLedgerColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-56" },
    cell: ({ row }) => {
      const { item } = row.original
      return (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {item.name}
          </p>
          <p className="truncate font-mono text-[11px] text-primary">
            {item.code}
          </p>
        </div>
      )
    },
  }),

  purchaseLedgerColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-16" },
  }),

  purchaseLedgerColumnHelper.accessor("quantity", {
    header: "SL cần mua",
    meta: quantityColumnMeta,
    cell: ({ getValue }) => (
      <PurchaseLedgerQuantityCell value={getValue()} tone="neutral" />
    ),
  }),

  purchaseLedgerColumnHelper.accessor("quotedQuantity", {
    header: "SL báo giá",
    meta: quantityColumnMeta,
    cell: ({ getValue }) => (
      <PurchaseLedgerQuantityCell value={getValue()} tone="primary" />
    ),
  }),

  purchaseLedgerColumnHelper.accessor("orderedQuantity", {
    header: "SL đặt mua",
    meta: quantityColumnMeta,
    cell: ({ getValue }) => (
      <PurchaseLedgerQuantityCell value={getValue()} tone="ordered" />
    ),
  }),

  purchaseLedgerColumnHelper.accessor("createdAt", {
    header: "Ngày tạo PR",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  purchaseLedgerColumnHelper.accessor("neededDate", {
    header: "Ngày cần",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  purchaseLedgerColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-32 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <PurchaseLedgerStatusBadge status={getValue()} />,
  }),

  purchaseLedgerColumnHelper.accessor("warnings", {
    header: "Cảnh báo",
    meta: { headerClassName: "min-w-36" },
    cell: ({ getValue }) => <PurchaseLedgerWarningCell warnings={getValue()} />,
  }),

  purchaseLedgerColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: () => <PurchaseLedgerActionsCell />,
  }),
]
