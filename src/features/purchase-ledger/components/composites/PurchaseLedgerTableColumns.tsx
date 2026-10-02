import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"
import { Gallery } from "@solar-icons/react"
import type { appTableFeatures } from "@/lib/table-features"

import { PurchaseLedgerStatusBadge } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerBadges"
import {
  PurchaseLedgerActionsCell,
  PurchaseLedgerQuantityCell,
  PurchaseLedgerSourceCell,
  PurchaseLedgerWarningCell,
} from "@/features/purchase-ledger/components/primitives/PurchaseLedgerTableCells"
import { resolveFileUrl } from "@/lib/file-url"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const purchaseLedgerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseLedgerRow
>()

// Shared by the 3 quantity columns — same idiom as OrdersTableColumns' moneyColumnMeta.
const quantityColumnMeta = {
  headerClassName: "min-w-28 text-right",
  cellClassName: "text-right",
}

export const purchaseLedgerColumns = purchaseLedgerColumnHelper.columns([
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
    meta: {
      headerClassName: "min-w-36",
      cellClassName: "max-w-56 truncate",
    },
    cell: ({ row }) => (
      <PurchaseLedgerSourceCell
        buyerPoNo={row.original.buyerPoNo}
        requestNote={row.original.requestNote}
      />
    ),
  }),

  purchaseLedgerColumnHelper.display({
    id: "image",
    header: "Hình ảnh",
    meta: {
      headerClassName: "w-20 text-center",
      cellClassName: "py-2 text-center",
    },
    cell: ({ row }) => {
      const { image, item } = row.original
      return (
        <div className="mx-auto flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
          {image ? (
            <a
              href={resolveFileUrl(image.url)}
              target="_blank"
              rel="noreferrer"
              className="size-full"
            >
              <img
                src={resolveFileUrl(image.url)}
                alt={item.name}
                loading="lazy"
                className="size-full object-cover"
              />
            </a>
          ) : (
            <Gallery className="size-4 text-muted-foreground/50" />
          )}
        </div>
      )
    },
  }),

  purchaseLedgerColumnHelper.display({
    id: "item",
    header: "Vật tư",
    meta: { headerClassName: "min-w-56" },
    cell: ({ row }) => {
      const { item } = row.original
      return (
        <div className="min-w-0">
          <p
            className="truncate text-xs font-semibold text-foreground"
            title={item.name}
          >
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

  purchaseLedgerColumnHelper.accessor("orderedQuantity", {
    header: "SL đặt mua",
    meta: quantityColumnMeta,
    cell: ({ getValue }) => (
      <PurchaseLedgerQuantityCell value={getValue()} tone="ordered" />
    ),
  }),

  purchaseLedgerColumnHelper.accessor("receivedQuantity", {
    header: "SL đã nhập kho",
    meta: quantityColumnMeta,
    cell: ({ row }) => (
      <PurchaseLedgerQuantityCell
        value={row.original.receivedQuantity}
        tone="received"
        comparisonTarget={row.original.orderedQuantity}
      />
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
    meta: {
      headerClassName: "min-w-36 text-center",
      cellClassName: "text-center",
    },
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
])
