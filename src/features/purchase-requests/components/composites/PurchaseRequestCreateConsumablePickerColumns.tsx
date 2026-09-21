import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import type { Consumable } from "@/lib/types/consumable.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const purchaseRequestConsumablePickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Consumable
>()

type BuildPurchaseRequestConsumablePickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: Consumable) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns, independent of the shared DataTable
// (src/components/shared/DataTable.tsx) — DataTable has no notion of row selection, same
// reasoning as purchase-quotations' CreateQuotationItemsPickerColumns.tsx (the repo's other
// checkbox-column picker). No shared "select column" helper exists either — every one of these
// tables closes over its own checked/disabled state.
export function buildPurchaseRequestConsumablePickerColumns({
  pickedIds,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildPurchaseRequestConsumablePickerColumnsArgs) {
  return purchaseRequestConsumablePickerColumnHelper.columns([
    purchaseRequestConsumablePickerColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allChecked}
          disabled={disabled}
          onCheckedChange={onToggleAll}
          aria-label="Chọn tất cả trang này"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          checked={pickedIds.has(row.original.id)}
          disabled={disabled}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.name}`}
        />
      ),
    }),
    purchaseRequestConsumablePickerColumnHelper.display({
      id: "consumable",
      header: "Vật tư",
      meta: { headerClassName: "min-w-56" },
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.name}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.code}
          </p>
        </div>
      ),
    }),
    purchaseRequestConsumablePickerColumnHelper.accessor(
      (row) => row.unit.name,
      {
        id: "unit",
        header: "ĐVT",
        meta: { headerClassName: "min-w-16" },
        cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
      }
    ),
    purchaseRequestConsumablePickerColumnHelper.accessor("minStock", {
      header: "Định mức tồn",
      meta: {
        headerClassName: "min-w-28 text-right",
        cellClassName: "text-right",
      },
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums">
          {quantityFormatter.format(getValue())}
        </span>
      ),
    }),
    purchaseRequestConsumablePickerColumnHelper.accessor(
      (row) => row.client?.name ?? "—",
      {
        id: "client",
        header: "Khách hàng",
        meta: { headerClassName: "min-w-32" },
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">{getValue()}</span>
        ),
      }
    ),
  ])
}
