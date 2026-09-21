import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"

import { Checkbox } from "@/components/ui/checkbox"
import type { Consumable } from "@/lib/types/consumable.type"

const inventoryReceiptReturnPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  Consumable
>()

type BuildInventoryReceiptReturnPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: Consumable) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns, cùng khuôn PurchaseRequestCreateConsumablePickerColumns.tsx — không có
// cột "Định mức tồn"/"Khách hàng" như bản đó vì bảng này đã lọc sẵn theo đúng 1 khách hàng
// (clientId chọn ở bước ①), lặp lại cột đó là thừa.
export function buildInventoryReceiptReturnPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildInventoryReceiptReturnPickerColumnsArgs) {
  return inventoryReceiptReturnPickerColumnHelper.columns([
    inventoryReceiptReturnPickerColumnHelper.display({
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
    inventoryReceiptReturnPickerColumnHelper.display({
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
    inventoryReceiptReturnPickerColumnHelper.accessor((row) => row.unit.name, {
      id: "unit",
      header: "ĐVT",
      meta: { headerClassName: "min-w-16" },
      cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
    }),
  ])
}
