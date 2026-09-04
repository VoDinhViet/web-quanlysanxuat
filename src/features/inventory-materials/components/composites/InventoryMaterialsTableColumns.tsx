import { createColumnHelper } from "@tanstack/react-table"
import type { appTableFeatures } from "@/lib/table-features"
import { Eye, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { InventoryMaterialStatusBadge } from "@/features/inventory-materials/components/primitives/InventoryMaterialStatusBadge"
import {
  MaterialImageCell,
  MaterialQuantityCell,
} from "@/features/inventory-materials/components/primitives/InventoryMaterialTableCells"
import type { MaterialInventoryItem } from "@/lib/types/inventory-material.type"
import { resolveInventoryStatus } from "@/lib/types/inventory-material.type"

const stockFormatter = new Intl.NumberFormat("vi-VN")

const inventoryColumnHelper = createColumnHelper<
  typeof appTableFeatures,
  MaterialInventoryItem
>()

// A right-aligned header with a decorative ⓘ + a static formula sub-line — mirrors
// inventory-products' header shape exactly (no hover tooltip, the formula is just printed).
function QuantityColumnHeader({
  label,
  formula,
}: {
  label: string
  formula: string
}) {
  return (
    <div className="flex flex-col items-end text-right">
      <span className="inline-flex items-center gap-1">
        {label}
        <HelpCircle className="size-3 text-muted-foreground/70" />
      </span>
      <span className="text-[10px] font-normal text-muted-foreground/80">
        ({formula})
      </span>
    </div>
  )
}

export const inventoryMaterialColumns = inventoryColumnHelper.columns([
  inventoryColumnHelper.display({
    id: "index",
    header: "STT",
    cell: ({ row }) => row.index + 1,
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  }),

  inventoryColumnHelper.display({
    id: "image",
    header: "Ảnh",
    meta: { headerClassName: "w-14 text-center", cellClassName: "text-center" },
    cell: ({ row }) => <MaterialImageCell item={row.original} />,
  }),

  inventoryColumnHelper.accessor("code", {
    header: "Mã vật tư",
    meta: { headerClassName: "min-w-28" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  inventoryColumnHelper.accessor("name", {
    header: "Tên vật tư",
    meta: { headerClassName: "min-w-48" },
    cell: ({ getValue }) => (
      <span className="truncate text-xs font-medium text-foreground">
        {getValue()}
      </span>
    ),
  }),

  inventoryColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-16" },
  }),

  inventoryColumnHelper.accessor("onHand", {
    header: () => (
      <QuantityColumnHeader label="Tồn thực tế" formula="Σ nhập - Σ xuất" />
    ),
    meta: { headerClassName: "min-w-32", cellClassName: "text-right" },
    cell: ({ getValue }) => (
      <MaterialQuantityCell value={getValue()} variant="blue" />
    ),
  }),

  // `issuable` — không phải field API, tự tính onHand - reserved (đúng công thức đã ghi ở dòng
  // phụ header, cùng công thức inventory-products đang dùng cho cột này).
  inventoryColumnHelper.display({
    id: "issuable",
    header: () => (
      <QuantityColumnHeader
        label="Có thể xuất"
        formula="Tồn thực tế - Đã giữ"
      />
    ),
    meta: { headerClassName: "min-w-32", cellClassName: "text-right" },
    cell: ({ row }) => (
      <MaterialQuantityCell
        value={row.original.onHand - row.original.reserved}
        variant="green"
      />
    ),
  }),

  // "Đã giữ"/"Tổng nhu cầu BOM" giờ là số thật (be-quanlysanxuat BUG-031/032, xem
  // inventory-material.type.ts) — vẫn gộp thành dòng phụ nhỏ dưới số Tồn khả dụng thay vì tách
  // cột riêng, giữ nguyên layout cũ.
  inventoryColumnHelper.accessor("available", {
    header: () => (
      <QuantityColumnHeader label="Tồn khả dụng" formula="TT - Đã giữ - BOM" />
    ),
    meta: { headerClassName: "min-w-40", cellClassName: "text-right" },
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex flex-col items-end gap-0.5">
          <MaterialQuantityCell value={item.available} variant="available" />
          <span className="text-[10px] whitespace-nowrap text-muted-foreground">
            Đã giữ {stockFormatter.format(item.reserved)} · BOM{" "}
            {stockFormatter.format(item.bomDemand)}
          </span>
        </div>
      )
    },
  }),

  inventoryColumnHelper.accessor("minStock", {
    header: "Min",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {stockFormatter.format(getValue())}
      </span>
    ),
  }),

  inventoryColumnHelper.display({
    id: "status",
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => (
      <InventoryMaterialStatusBadge
        status={resolveInventoryStatus(
          row.original.available,
          row.original.minStock
        )}
      />
    ),
  }),

  inventoryColumnHelper.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "font-normal",
    },
    cell: () => (
      <div className="flex items-center justify-center">
        <TooltipTrigger>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Xem chi tiết"
            className="text-muted-foreground hover:border-primary/30 hover:text-primary"
          >
            <Eye className="size-3.5" />
          </Button>
          <Tooltip>Xem chi tiết</Tooltip>
        </TooltipTrigger>
      </div>
    ),
  }),
])
