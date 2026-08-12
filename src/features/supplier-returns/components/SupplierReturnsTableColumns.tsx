import { DateTime } from "luxon"
import { createColumnHelper } from "@tanstack/react-table"

import { SupplierReturnStatusBadge } from "@/features/supplier-returns/components/SupplierReturnBadges"
import { SupplierReturnActionsCell } from "@/features/supplier-returns/components/SupplierReturnsTableCells"
import type { SupplierReturn } from "@/lib/types/supplier-return.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const supplierReturnColumnHelper = createColumnHelper<SupplierReturn>()

// Trimmed to what's needed to scan the list at a glance — Mã IQC/Mã NK/PO moved to the detail
// page (opened from "Thao tác"), and mã/tên vật tư + SL trả/ĐVT each collapse into one column,
// same identity-cell idiom as ProductsTableColumns.
export const supplierReturnsColumns = [
  supplierReturnColumnHelper.accessor("code", {
    header: "Mã trả NCC",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono font-semibold text-primary">{getValue()}</span>
    ),
  }),

  supplierReturnColumnHelper.display({
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

  supplierReturnColumnHelper.accessor((row) => row.supplier.name, {
    id: "supplier",
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-36" },
  }),

  supplierReturnColumnHelper.display({
    id: "quantity",
    header: "SL trả",
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

  supplierReturnColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => <SupplierReturnStatusBadge status={getValue()} />,
  }),

  supplierReturnColumnHelper.accessor("returnDate", {
    header: "Ngày trả",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy"),
  }),

  supplierReturnColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-24 text-center",
      cellClassName: "font-normal",
    },
    cell: ({ row }) => (
      <SupplierReturnActionsCell supplierReturn={row.original} />
    ),
  }),
]
