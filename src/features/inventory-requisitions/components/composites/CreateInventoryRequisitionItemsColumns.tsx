import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import type { AnyFieldApi } from "@tanstack/react-form"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { NumericCellInput } from "@/components/shared/primitives/NumericCellInput"
import { TableTextCellInput } from "@/components/shared/primitives/TableTextCellInput"
import {
  ColumnHeaderWithHint,
  formatNullableQuantity,
} from "@/features/inventory-requisitions/components/composites/CreateInventoryRequisitionPickerColumns"
import type { InventoryRequisitionItemFormValue } from "@/features/inventory-requisitions/schemas/create-inventory-requisition.schema"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

const createInventoryRequisitionItemColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  InventoryRequisitionItemFormValue
>()

type BuildCreateInventoryRequisitionItemColumnsArgs = {
  itemsField: AnyFieldApi
  disabled?: boolean
}

// Own useReactTable columns cho bước ③, cùng khuôn InventoryReceiptCreateFromPoItemsColumns.tsx —
// mỗi ô ghi trực tiếp vào `itemsField` qua `row.index`/`row.original`. Cảnh báo vượt ngưỡng dùng
// đúng 2 điều kiện của inventoryRequisitionItemFormSchema's 2 `.refine` (E231/E232) — gõ vượt vẫn
// được (không khoá phím), chỉ chặn ở submit.
export function buildCreateInventoryRequisitionItemColumns({
  itemsField,
  disabled,
}: BuildCreateInventoryRequisitionItemColumnsArgs) {
  return createInventoryRequisitionItemColumnHelper.columns([
    createInventoryRequisitionItemColumnHelper.display({
      id: "index",
      header: "STT",
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "material",
      header: "Vật tư",
      meta: { headerClassName: "min-w-56" },
      cell: ({ row }) => (
        <div>
          <p className="text-xs font-semibold text-foreground">
            {row.original.line.itemName}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.line.itemCode}
          </p>
        </div>
      ),
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "unit",
      header: "ĐVT",
      meta: {
        headerClassName: "w-16",
        cellClassName: "text-muted-foreground",
      },
      cell: ({ row }) => (
        <span className="text-xs">{row.original.line.unitName}</span>
      ),
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "issuableQuantity",
      header: () => (
        <ColumnHeaderWithHint
          label="Có thể lãnh"
          hint="Tồn thực tế trừ Đã giữ — SL lãnh tối đa được phép nhập ở dòng này."
        />
      ),
      meta: {
        headerClassName: "w-24 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) =>
        quantityFormatter.format(row.original.line.issuableQuantity),
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "bomRemaining",
      header: () => (
        <ColumnHeaderWithHint
          label="SL BOM còn lại"
          hint="Định mức BOM trừ phần đã lãnh trước đó cho Job này. Trống nếu lãnh thủ công."
        />
      ),
      meta: {
        headerClassName: "w-28 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row }) => {
        const { bomQuantity, issuedQuantity } = row.original.line
        if (bomQuantity === null) return "—"
        return formatNullableQuantity(
          Math.max(0, bomQuantity - (issuedQuantity ?? 0))
        )
      },
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "quantity",
      header: "SL lãnh",
      meta: { headerClassName: "w-36 text-right" },
      cell: ({ row }) => {
        const item = row.original
        const { issuableQuantity, bomQuantity, issuedQuantity } = item.line
        const quantity = item.quantity ?? 0
        const exceedsIssuable = quantity > issuableQuantity
        const bomRemaining =
          bomQuantity === null
            ? null
            : Math.max(0, bomQuantity - (issuedQuantity ?? 0))
        const exceedsBom = bomRemaining !== null && quantity > bomRemaining

        return (
          <div>
            <NumericCellInput
              value={item.quantity}
              min={0}
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, quantity: value })
              }
            />
            {exceedsIssuable && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL có thể lãnh (
                {quantityFormatter.format(issuableQuantity)})
              </p>
            )}
            {!exceedsIssuable && exceedsBom && (
              <p className="mt-1 text-right text-[10px] text-destructive">
                Vượt SL BOM còn lại ({quantityFormatter.format(bomRemaining)})
              </p>
            )}
          </div>
        )
      },
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "note",
      header: "Ghi chú",
      meta: { headerClassName: "w-48" },
      cell: ({ row }) => {
        const item = row.original
        const inputId = `requisition-item-note-${row.index}`
        return (
          <>
            <label htmlFor={inputId} className="sr-only">
              Ghi chú — {item.line.itemName}
            </label>
            <TableTextCellInput
              id={inputId}
              value={item.note}
              placeholder="Ghi chú (nếu có)"
              disabled={disabled}
              onValueChange={(value) =>
                itemsField.replaceValue(row.index, { ...item, note: value })
              }
            />
          </>
        )
      },
    }),
    createInventoryRequisitionItemColumnHelper.display({
      id: "actions",
      header: "Thao tác",
      meta: {
        headerClassName: "w-14 text-center",
        cellClassName: "text-center",
      },
      cell: ({ row }) => (
        <TooltipTrigger>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Bỏ dòng ${row.index + 1}`}
            className="text-muted-foreground hover:border-destructive/30 hover:text-destructive"
            isDisabled={disabled}
            onPress={() => itemsField.removeValue(row.index)}
          >
            <Trash2 className="size-3.5" />
          </Button>
          <Tooltip>{`Bỏ dòng ${row.index + 1}`}</Tooltip>
        </TooltipTrigger>
      ),
    }),
  ])
}
