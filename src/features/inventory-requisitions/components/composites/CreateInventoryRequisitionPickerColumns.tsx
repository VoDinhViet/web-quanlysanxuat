import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Info } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { InventoryRequisitionLine } from "@/lib/types/inventory-requisition.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// "6 số"/SL gợi ý là công thức riêng của domain (docs/domains/inventory.md, mục "Phiếu lãnh vật
// tư") — không tự giải thích được từ mỗi tên cột viết tắt, nên mỗi cột số ở đây (và ở
// CreateInventoryRequisitionItemsColumns.tsx bước ③, dùng chung header này) có icon (i) giải
// thích khi hover thay vì rải chú thích thành văn bản choán chỗ trong bảng.
export function ColumnHeaderWithHint({
  label,
  hint,
}: {
  label: string
  hint: string
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger
          render={
            <Info className="size-3 shrink-0 cursor-help text-muted-foreground/70" />
          }
        />
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </span>
  )
}

const inventoryRequisitionPickerColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  InventoryRequisitionLine
>()

type BuildCreateInventoryRequisitionPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
  hasPickableRows?: boolean
  onToggleRow: (row: InventoryRequisitionLine) => void
  onToggleAll: (checked: boolean) => void
}

// Own useReactTable columns, cùng khuôn PurchaseRequestCreateMaterialPickerColumns.tsx (picker
// checkbox khác của repo) — "6 số" + SL gợi ý cho bảng chọn vật tư ở bước ②. bomQuantity/
// issuedQuantity/suggestedQuantity hiện "—" khi null (luồng "Lãnh thủ công", không có Job).
// availableQuantity có thể âm (backend ghi rõ "chỉ tham khảo") — tô đỏ khi < 0.
export function buildCreateInventoryRequisitionPickerColumns({
  pickedIds,
  disabled,
  allChecked,
  hasPickableRows = true,
  onToggleRow,
  onToggleAll,
}: BuildCreateInventoryRequisitionPickerColumnsArgs) {
  return inventoryRequisitionPickerColumnHelper.columns([
    inventoryRequisitionPickerColumnHelper.display({
      id: "select",
      header: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={allChecked}
            disabled={disabled || !hasPickableRows}
            onCheckedChange={onToggleAll}
            aria-label="Chọn tất cả trang này"
          />
        </div>
      ),
      meta: { headerClassName: "w-10" },
      cell: ({ row }) => {
        const isUnpickable =
          row.original.isFullyIssued || row.original.issuableQuantity <= 0
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={pickedIds.has(row.original.item.id)}
              disabled={disabled || isUnpickable}
              onCheckedChange={() => onToggleRow(row.original)}
              aria-label={`Chọn ${row.original.item.name}`}
            />
          </div>
        )
      },
    }),
    inventoryRequisitionPickerColumnHelper.display({
      id: "material",
      header: "Vật tư",
      meta: { headerClassName: "min-w-56" },
      cell: ({ row }) => {
        const isFullyIssued = row.original.isFullyIssued
        const isOutOfStock = row.original.issuableQuantity <= 0
        const isUnpickable = isFullyIssued || isOutOfStock

        return (
          <div>
            <div className="flex items-center gap-1.5">
              <p
                className={cn(
                  "text-xs font-semibold",
                  isUnpickable ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {row.original.item.name}
              </p>
              {isFullyIssued && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Đã lãnh đủ
                </span>
              )}
              {!isFullyIssued && isOutOfStock && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  Hết tồn kho
                </span>
              )}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              {row.original.item.code}
            </p>
          </div>
        )
      },
    }),
    inventoryRequisitionPickerColumnHelper.accessor(
      (row) => row.item.unit.name,
      {
        id: "unit",
        header: "ĐVT",
        meta: { headerClassName: "min-w-14" },
        cell: ({ getValue }) => <span className="text-xs">{getValue()}</span>,
      }
    ),
    inventoryRequisitionPickerColumnHelper.accessor("bomQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="SL BOM"
          hint="Định mức BOM của Job cho vật tư này. Trống nếu lãnh thủ công (không gắn Job)."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => {
        const val = getValue()
        return val === null ? "—" : quantityFormatter.format(val)
      },
    }),
    inventoryRequisitionPickerColumnHelper.accessor("issuedQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="Đã lãnh"
          hint="Tổng SL đã lãnh (phiếu Đã xuất) cho Job này."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ row, getValue }) => {
        const val = getValue()
        if (val === null || row.original.bomQuantity === null) {
          return "—"
        }
        const remainingBom = row.original.remainingBom ?? 0

        return (
          <div>
            <span className="text-xs">{quantityFormatter.format(val)}</span>
            {remainingBom > 0 ? (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Thiếu {quantityFormatter.format(remainingBom)}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">Đủ định mức</p>
            )}
          </div>
        )
      },
    }),
    inventoryRequisitionPickerColumnHelper.accessor("onHand", {
      header: () => (
        <ColumnHeaderWithHint
          label="Tồn thực tế"
          hint="Tồn kho thực tế tại Kho nguyên vật liệu."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    inventoryRequisitionPickerColumnHelper.accessor("reservedQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="Đã giữ"
          hint="Tổng SL đang giữ ở các phiếu lãnh khác đã duyệt, chưa xuất."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-muted-foreground",
      },
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
    }),
    inventoryRequisitionPickerColumnHelper.accessor("issuableQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="Có thể lãnh"
          hint="Tồn thực tế trừ Đã giữ — SL lãnh tối đa được phép nhập ở dòng này."
        />
      ),
      meta: {
        headerClassName: "min-w-24 text-right",
        cellClassName: "text-right font-medium tabular-nums text-foreground",
      },
      cell: ({ row, getValue }) => {
        const value = getValue()
        const isOutOfStock = value <= 0
        const isNeeded = !row.original.isFullyIssued

        return (
          <div>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                isOutOfStock && isNeeded
                  ? "font-semibold text-destructive"
                  : isOutOfStock
                    ? "text-muted-foreground"
                    : "text-foreground"
              )}
            >
              {quantityFormatter.format(value)}
            </span>
            {isOutOfStock && isNeeded && (
              <p className="text-[10px] text-destructive">Hết tồn kho</p>
            )}
          </div>
        )
      },
    }),
    inventoryRequisitionPickerColumnHelper.accessor("availableQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="Khả dụng"
          hint="Tồn trừ nhu cầu BOM còn thiếu của mọi Job. Chỉ để tham khảo, có thể âm."
        />
      ),
      meta: { headerClassName: "min-w-20 text-right" },
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span
            className={
              value < 0
                ? "text-right text-xs text-destructive tabular-nums"
                : "text-right text-xs tabular-nums"
            }
          >
            {quantityFormatter.format(value)}
          </span>
        )
      },
    }),
    inventoryRequisitionPickerColumnHelper.accessor("suggestedQuantity", {
      header: () => (
        <ColumnHeaderWithHint
          label="SL gợi ý"
          hint="Gợi ý = phần BOM còn thiếu, không vượt SL có thể lãnh. Sửa được khi nhập SL."
        />
      ),
      meta: {
        headerClassName: "min-w-20 text-right",
        cellClassName: "text-right tabular-nums text-primary",
      },
      cell: ({ getValue }) => {
        const val = getValue()
        return val === null ? "—" : quantityFormatter.format(val)
      },
    }),
  ])
}
