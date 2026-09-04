import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import type { PickedQuotationItemValue } from "@/features/purchase-quotations/schemas/create-purchase-quotation.schema"

const quotationAddSupplierItemsColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  PickedQuotationItemValue
>()

type BuildQuotationAddSupplierItemsColumnsArgs = {
  checkedIds: Set<string>
  // Items that already list the currently-picked supplier — rendered checked + disabled with an
  // "(đã có)" hint instead of vanishing from the table, so the row count never shifts under the
  // cursor and it's clear WHY a row can't be toggled.
  assignedIds: Set<string>
  allChecked: boolean
  onToggleItem: (itemId: string) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns for QuotationAddSupplierItems — same row type
// (PickedQuotationItemValue) and width/style conventions as
// CreateQuotationSuppliersItemColumns.tsx, so the picker table reads consistently with the outer
// vật tư table it's selecting from. No shared "select column" helper exists in the repo (every
// checkbox-column table builds its own, see CreateQuotationItemsPickerColumns.tsx) since each one
// closes over different checked/disabled state.
export function buildQuotationAddSupplierItemsColumns({
  checkedIds,
  assignedIds,
  allChecked,
  onToggleItem,
  onToggleAll,
}: BuildQuotationAddSupplierItemsColumnsArgs) {
  return quotationAddSupplierItemsColumnHelper.columns([
    quotationAddSupplierItemsColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          isSelected={allChecked}
          onChange={onToggleAll}
          aria-label="Chọn tất cả"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => {
        const isAssigned = assignedIds.has(row.original.itemId)
        return (
          <Checkbox
            isSelected={isAssigned || checkedIds.has(row.original.itemId)}
            isDisabled={isAssigned}
            onChange={() => onToggleItem(row.original.itemId)}
            aria-label={`Chọn ${row.original.itemName}`}
          />
        )
      },
    }),
    quotationAddSupplierItemsColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    quotationAddSupplierItemsColumnHelper.accessor("itemCode", {
      header: "Mã vật tư",
      meta: {
        headerClassName: "w-28",
        cellClassName: "font-mono text-primary",
      },
    }),
    quotationAddSupplierItemsColumnHelper.display({
      id: "itemName",
      header: "Tên vật tư",
      cell: ({ row }) => {
        const isAssigned = assignedIds.has(row.original.itemId)
        return (
          <span>
            {row.original.itemName}
            {isAssigned && (
              <span className="ml-1 text-[11px] text-muted-foreground">
                (đã có)
              </span>
            )}
          </span>
        )
      },
    }),
    quotationAddSupplierItemsColumnHelper.accessor("unit", {
      header: "ĐVT",
      meta: { headerClassName: "w-16" },
    }),
    quotationAddSupplierItemsColumnHelper.display({
      id: "requestedQuantity",
      header: "SL yêu cầu",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ row }) =>
        row.original.allocations.reduce(
          (sum, allocation) => sum + allocation.requestedQuantity,
          0
        ),
    }),
  ])
}
