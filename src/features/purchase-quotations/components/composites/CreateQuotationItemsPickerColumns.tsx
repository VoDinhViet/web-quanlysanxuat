import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { Checkbox } from "@/components/ui/checkbox"
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
      cell: ({ row }) => (
        <Checkbox
          isSelected={pickedIds.has(row.original.id)}
          isDisabled={disabled}
          onChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.item.name}`}
        />
      ),
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
      header: "SL cần mua",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums">{getValue()}</span>
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
