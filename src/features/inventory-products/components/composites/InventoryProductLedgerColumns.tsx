import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { ProductLedgerMovementTypeBadge } from "@/features/inventory-products/components/primitives/InventoryProductLedgerBadges"
import {
  InventoryProductLedgerBalanceCell,
  InventoryProductLedgerDescriptionCell,
  InventoryProductLedgerQuantityCell,
  InventoryProductLedgerReferenceCell,
} from "@/features/inventory-products/components/primitives/InventoryProductLedgerCells"
import type { ProductLedgerEntry } from "@/lib/types/product-ledger.type"
import { resolveProductLedgerMovementType } from "@/lib/types/product-ledger.type"

const productLedgerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  ProductLedgerEntry
>()

const quantityColumnMeta = {
  headerClassName: "min-w-24 text-right",
  cellClassName: "text-right",
}

// No "Số PO" sortable column — dropped from the mockup: zero sortable-column precedent exists
// anywhere in this codebase (every table is getCoreRowModel() only); "Diễn giải" already surfaces
// Job/Đơn/DO liên quan (xem InventoryProductLedgerDescriptionCell).
export const inventoryProductLedgerColumns = productLedgerColumnHelper.columns([
  productLedgerColumnHelper.display({
    id: "index",
    header: "STT",
    cell: ({ row }) => row.index + 1,
    meta: { headerClassName: "w-12 text-center", cellClassName: "text-center" },
  }),

  productLedgerColumnHelper.accessor("transactionDate", {
    header: "Ngày",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  productLedgerColumnHelper.display({
    id: "movementType",
    header: "Loại giao dịch",
    meta: { headerClassName: "min-w-36" },
    cell: ({ row }) => (
      <ProductLedgerMovementTypeBadge
        type={resolveProductLedgerMovementType(row.original)}
      />
    ),
  }),

  productLedgerColumnHelper.display({
    id: "referenceCode",
    header: "Mã chứng từ",
    meta: { headerClassName: "min-w-32" },
    cell: ({ row }) => (
      <InventoryProductLedgerReferenceCell entry={row.original} />
    ),
  }),

  productLedgerColumnHelper.display({
    id: "description",
    header: "Diễn giải",
    meta: { headerClassName: "min-w-40" },
    cell: ({ row }) => (
      <InventoryProductLedgerDescriptionCell entry={row.original} />
    ),
  }),

  productLedgerColumnHelper.display({
    id: "in",
    header: "Nhập",
    meta: quantityColumnMeta,
    cell: ({ row }) => {
      const { quantity } = row.original

      return quantity > 0 ? (
        <InventoryProductLedgerQuantityCell value={quantity} tone="in" />
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  }),

  productLedgerColumnHelper.display({
    id: "out",
    header: "Xuất",
    meta: quantityColumnMeta,
    cell: ({ row }) => {
      const { quantity } = row.original

      return quantity < 0 ? (
        <InventoryProductLedgerQuantityCell value={quantity} tone="out" />
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  }),

  productLedgerColumnHelper.accessor("balanceAfter", {
    header: "Tồn sau giao dịch",
    meta: quantityColumnMeta,
    cell: ({ getValue }) => (
      <InventoryProductLedgerBalanceCell value={getValue()} />
    ),
  }),

  productLedgerColumnHelper.accessor((row) => row.creatorBy?.fullName, {
    id: "creator",
    header: "Người thực hiện",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => getValue() ?? "—",
  }),
])
