import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { DateTime } from "luxon"

import { Checkbox } from "@/components/ui/checkbox"
import type { PurchaseLedgerRow } from "@/lib/types/purchase-ledger.type"

const purchaseOrderItemsPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PurchaseLedgerRow
>()

type BuildPurchaseOrderItemsPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  onToggleRow: (row: PurchaseLedgerRow) => void
}

// Own useReactTable columns, independent of the shared DataTable — same reasoning as
// purchase-quotations' CreateQuotationItemsPickerColumns.tsx, which this mirrors.
export function buildPurchaseOrderItemsPickerColumns({
  pickedIds,
  disabled,
  onToggleRow,
}: BuildPurchaseOrderItemsPickerColumnsArgs) {
  return purchaseOrderItemsPickerColumnHelper.columns([
    purchaseOrderItemsPickerColumnHelper.display({
      id: "select",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          checked={pickedIds.has(row.original.id)}
          disabled={disabled}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.item.name}`}
        />
      ),
    }),
    purchaseOrderItemsPickerColumnHelper.accessor(
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
    purchaseOrderItemsPickerColumnHelper.display({
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
    purchaseOrderItemsPickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
    }),
    purchaseOrderItemsPickerColumnHelper.accessor("quantity", {
      header: "SL cần mua",
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums">{getValue()}</span>
      ),
    }),
    purchaseOrderItemsPickerColumnHelper.accessor("neededDate", {
      header: "Ngày cần",
      meta: { headerClassName: "text-center", cellClassName: "text-center" },
      cell: ({ getValue }) => (
        <span className="text-xs">
          {DateTime.fromISO(getValue()).toFormat("dd/MM/yyyy")}
        </span>
      ),
    }),
  ])
}
