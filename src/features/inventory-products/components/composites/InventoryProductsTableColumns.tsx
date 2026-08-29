import { HelpCircle } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import {
  InventoryProductActionsCell,
  ProductImageCell,
  QuantityCell,
} from "@/features/inventory-products/components/primitives/InventoryProductTableCells"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"

const col = createColumnHelper<ProductInventoryItem>()

// A right-aligned header with a decorative ⓘ + a static formula sub-line — same shape
// inventory-materials uses for its own quantity columns.
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

export const inventoryProductsColumns = [
  col.display({
    id: "stt",
    header: "STT",
    meta: {
      headerClassName: "w-11 min-w-11 text-center",
      cellClassName: "text-center text-muted-foreground font-mono text-xs",
    },
    cell: ({ row }) => row.index + 1,
  }),

  col.display({
    id: "image",
    header: "Ảnh",
    meta: {
      headerClassName: "w-14 min-w-14 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => <ProductImageCell product={row.original} />,
  }),

  col.accessor("code", {
    header: "Mã thành phẩm",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold text-primary">
        {getValue()}
      </span>
    ),
  }),

  col.accessor("name", {
    header: "Tên thành phẩm",
    meta: { headerClassName: "min-w-36" },
  }),

  col.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center text-xs",
    },
  }),

  col.accessor("onHand", {
    header: () => (
      <QuantityColumnHeader label="Tồn thực tế" formula="Σ nhập - Σ xuất" />
    ),
    meta: {
      headerClassName: "min-w-36 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <QuantityCell value={getValue()} variant="blue" />,
  }),

  col.accessor("reserved", {
    header: () => (
      <QuantityColumnHeader
        label="Đã giữ"
        formula="Lệnh xuất hàng (DO) đang chờ duyệt/giao"
      />
    ),
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <QuantityCell value={getValue()} variant="orange" />
    ),
  }),

  col.accessor("available", {
    header: () => (
      <QuantityColumnHeader
        label="Tồn TP khả dụng"
        formula="Tồn thực tế - Đã giữ - BOM"
      />
    ),
    meta: {
      headerClassName: "min-w-44 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <QuantityCell value={getValue()} variant="available" />
    ),
  }),

  col.display({
    id: "actions",
    header: "Thao tác",
    meta: {
      headerClassName: "min-w-20 text-center",
      cellClassName: "text-center font-normal",
    },
    cell: ({ row }) => <InventoryProductActionsCell product={row.original} />,
  }),
]
