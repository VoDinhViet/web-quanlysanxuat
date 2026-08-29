import { createColumnHelper } from "@tanstack/react-table"
import { Info } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { InventoryRequisitionLine } from "@/lib/types/inventory-requisition.type"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Dùng chung với CreateInventoryRequisitionItemsColumns.tsx (bước ③) — cùng hiện "—" cho
// bomQuantity/issuedQuantity/suggestedQuantity khi null (không có Job).
export function formatNullableQuantity(value: number | null): string {
  return value === null ? "—" : quantityFormatter.format(value)
}

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
        <TooltipTrigger asChild>
          <Info className="size-3 shrink-0 cursor-help text-muted-foreground/70" />
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </span>
  )
}

const inventoryRequisitionPickerColumnHelper =
  createColumnHelper<InventoryRequisitionLine>()

type BuildCreateInventoryRequisitionPickerColumnsArgs = {
  pickedIds: Set<string>
  disabled: boolean
  allChecked: boolean
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
  onToggleRow,
  onToggleAll,
}: BuildCreateInventoryRequisitionPickerColumnsArgs) {
  return [
    inventoryRequisitionPickerColumnHelper.display({
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
          checked={pickedIds.has(row.original.item.id)}
          disabled={disabled}
          onCheckedChange={() => onToggleRow(row.original)}
          aria-label={`Chọn ${row.original.item.name}`}
        />
      ),
    }),
    inventoryRequisitionPickerColumnHelper.display({
      id: "material",
      header: "Vật tư",
      meta: { headerClassName: "min-w-56" },
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
      cell: ({ getValue }) => formatNullableQuantity(getValue()),
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
      cell: ({ getValue }) => formatNullableQuantity(getValue()),
    }),
    inventoryRequisitionPickerColumnHelper.accessor("onHand", {
      header: () => (
        <ColumnHeaderWithHint
          label="Tồn"
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
      cell: ({ getValue }) => quantityFormatter.format(getValue()),
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
      cell: ({ getValue }) => formatNullableQuantity(getValue()),
    }),
  ]
}
