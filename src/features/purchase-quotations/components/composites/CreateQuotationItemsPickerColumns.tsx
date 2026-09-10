import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { Checkbox } from "@/components/ui/checkbox"
import { PurchaseLedgerStatusBadge } from "@/features/purchase-ledger/components/primitives/PurchaseLedgerBadges"
import { PurchaseLedgerStatus } from "@/lib/types/purchase-ledger.type"
import { cn } from "@/lib/utils"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const quotationItemsPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseLedgerRow
>()

type BuildQuotationItemsPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  onToggleRow: (row: PurchaseLedgerRow) => void
}

// Own useReactTable columns, independent of the shared DataTable
// (src/components/shared/DataTable.tsx) — DataTable has no notion of row selection, and every
// column here needs to read/write the same `pickedIds`/`onToggleRow` closures the row-click
// handler in CreateQuotationItemsPickerSection also uses, so it's built as its own factory
// instead of trying to bolt selection state onto DataTable's generic column shape.
export function buildQuotationItemsPickerColumns({
  pickedIds,
  disabled,
  onToggleRow,
}: BuildQuotationItemsPickerColumnsArgs) {
  return quotationItemsPickerColumnHelper.columns([
    quotationItemsPickerColumnHelper.display({
      id: "select",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => {
        const remaining = Math.max(
          0,
          row.original.quantity - (row.original.quotedQuantity ?? 0)
        )
        const isCompleted =
          row.original.status === PurchaseLedgerStatus.COMPLETED ||
          remaining <= 0
        return (
          <Checkbox
            checked={pickedIds.has(row.original.id)}
            disabled={disabled || isCompleted}
            onCheckedChange={() => onToggleRow(row.original)}
            aria-label={`Chọn ${row.original.item.name}`}
          />
        )
      },
    }),
    quotationItemsPickerColumnHelper.accessor(
      (row) => row.purchaseRequest.code,
      {
        id: "purchaseRequestCode",
        header: "Mã PR",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-primary">
            {getValue()}
          </span>
        ),
      }
    ),
    quotationItemsPickerColumnHelper.display({
      id: "item",
      header: "Vật tư",
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.item.name}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.item.code}
          </p>
        </div>
      ),
    }),
    quotationItemsPickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
    }),
    quotationItemsPickerColumnHelper.accessor("quantity", {
      header: "SL đề xuất",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums text-muted-foreground">
          {getValue()}
        </span>
      ),
    }),
    quotationItemsPickerColumnHelper.accessor("quotedQuantity", {
      header: "SL đã báo",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ getValue }) => {
        const val = getValue() ?? 0
        return (
          <span
            className={cn(
              "text-xs tabular-nums",
              val > 0
                ? "font-medium text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          >
            {val}
          </span>
        )
      },
    }),
    quotationItemsPickerColumnHelper.display({
      id: "remainingQuantity",
      header: "SL cần mua",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ row }) => {
        const remaining = Math.max(
          0,
          row.original.quantity - (row.original.quotedQuantity ?? 0)
        )
        return (
          <span
            className={cn(
              "text-xs tabular-nums font-semibold",
              remaining > 0
                ? "text-primary"
                : "text-muted-foreground/60 font-normal"
            )}
          >
            {remaining}
          </span>
        )
      },
    }),
    quotationItemsPickerColumnHelper.accessor("status", {
      header: "Trạng thái",
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => (
        <div className="flex justify-center">
          <PurchaseLedgerStatusBadge status={getValue()} />
        </div>
      ),
    }),
    quotationItemsPickerColumnHelper.accessor("neededDate", {
      header: "Ngày cần",
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
      cell: ({ getValue }) => (
        <span className="text-xs">
          {DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy")}
        </span>
      ),
    }),
  ])
}
