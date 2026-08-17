import { createColumnHelper } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const outsourcingOrderPickerColumnHelper =
  createColumnHelper<OutsourceableOperation>()

type BuildCreateOutsourcingOrderPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  onToggleRow: (row: OutsourceableOperation) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns, independent of the shared DataTable — same reasoning as
// PurchaseRequestCreateMaterialPickerColumns.tsx (the repo's other checkbox-column picker). A row
// đã gửi đủ định mức (`remainingQuantity <= 0`) không chọn được, bất kể prop `disabled`.
export function buildCreateOutsourcingOrderPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  onToggleRow,
  onToggleAll,
}: BuildCreateOutsourcingOrderPickerColumnsArgs) {
  return [
    outsourcingOrderPickerColumnHelper.display({
      id: "select",
      header: () => (
        <Checkbox
          checked={allChecked}
          disabled={disabled}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          aria-label="Chọn tất cả trang này"
        />
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <Checkbox
          checked={pickedIds.has(row.original.id)}
          disabled={disabled || row.original.remainingQuantity <= 0}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.itemName}`}
        />
      ),
    }),
    outsourcingOrderPickerColumnHelper.accessor("productionJobCode", {
      header: "Job",
      meta: {
        headerClassName: "min-w-24",
        cellClassName: "font-mono text-xs text-muted-foreground",
      },
    }),
    outsourcingOrderPickerColumnHelper.display({
      id: "item",
      header: "Chi tiết",
      meta: { headerClassName: "min-w-48" },
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.itemName}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.itemCode}
          </p>
        </div>
      ),
    }),
    outsourcingOrderPickerColumnHelper.accessor("operationName", {
      header: "Công đoạn",
      meta: { headerClassName: "min-w-32" },
    }),
    outsourcingOrderPickerColumnHelper.accessor("unitName", {
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
    }),
    outsourcingOrderPickerColumnHelper.accessor("plannedQuantity", {
      header: "SL định mức",
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    outsourcingOrderPickerColumnHelper.accessor("sentQuantity", {
      header: "Đã gửi",
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    outsourcingOrderPickerColumnHelper.display({
      id: "remaining",
      header: "Còn được phép gửi",
      meta: { headerClassName: "w-36 text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        row.original.remainingQuantity > 0 ? (
          <span className="font-semibold text-foreground tabular-nums">
            {quantityFormatter.format(row.original.remainingQuantity)}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Đã gửi đủ
          </span>
        ),
    }),
  ]
}
