import { HelpCircle } from "lucide-react"
import { createColumnHelper } from "@tanstack/react-table"

import {
  InventoryProductActionsCell,
  ProductImageCell,
  QuantityCell,
} from "@/features/inventory-products/components/InventoryProductsTableCells"
import type { InventoryProduct } from "@/lib/types/inventory-product.type"

const col = createColumnHelper<InventoryProduct>()

export const inventoryProductsColumns = [
  col.display({
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        className="size-3.5 cursor-pointer rounded border-border accent-primary"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        aria-label="Chọn tất cả"
      />
    ),
    meta: {
      headerClassName: "w-9 min-w-9 text-center",
      cellClassName: "text-center",
    },
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="size-3.5 cursor-pointer rounded border-border accent-primary"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Chọn sản phẩm ${row.original.code}`}
      />
    ),
  }),

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

  col.accessor("unit", {
    header: "ĐVT",
    meta: {
      headerClassName: "min-w-16 text-center",
      cellClassName: "text-center text-xs",
    },
  }),

  col.accessor("clientName", {
    header: "Khách hàng",
    meta: { headerClassName: "min-w-36" },
  }),

  col.accessor("poDemandQuantity", {
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="inline-flex items-center gap-1">
          Tổng nhu cầu PO
          <HelpCircle className="size-3 text-muted-foreground/70" />
        </span>
        <span className="text-[10px] font-normal text-muted-foreground/80">
          (Chưa giao)
        </span>
      </div>
    ),
    meta: {
      headerClassName: "min-w-36 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <QuantityCell value={getValue()} variant="blue" />,
  }),

  col.accessor("actualQuantity", {
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="inline-flex items-center gap-1">
          Tồn thực tế
          <HelpCircle className="size-3 text-muted-foreground/70" />
        </span>
        <span className="text-[10px] font-normal text-muted-foreground/80">
          (Đã QC đạt)
        </span>
      </div>
    ),
    meta: {
      headerClassName: "min-w-36 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <QuantityCell value={getValue()} variant="blue" />,
  }),

  col.accessor("reservedQuantity", {
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="inline-flex items-center gap-1">
          Đã giữ
          <HelpCircle className="size-3 text-muted-foreground/70" />
        </span>
        <span className="text-[10px] font-normal text-muted-foreground/80">
          (DO chưa giao)
        </span>
      </div>
    ),
    meta: {
      headerClassName: "min-w-32 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => (
      <QuantityCell value={getValue()} variant="orange" />
    ),
  }),

  col.accessor("exportableQuantity", {
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="inline-flex items-center gap-1">
          Có thể xuất
          <HelpCircle className="size-3 text-muted-foreground/70" />
        </span>
        <span className="text-[10px] font-normal text-muted-foreground/80">
          (Tồn thực tế - Đã giữ)
        </span>
      </div>
    ),
    meta: {
      headerClassName: "min-w-40 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <QuantityCell value={getValue()} variant="green" />,
  }),

  col.accessor("availableQuantity", {
    header: () => (
      <div className="flex flex-col items-end text-right">
        <span className="inline-flex items-center gap-1">
          Tồn TP khả dụng
          <HelpCircle className="size-3 text-muted-foreground/70" />
        </span>
        <span className="text-[10px] font-normal text-muted-foreground/80">
          (Tồn thực tế - Nhu cầu PO)
        </span>
      </div>
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
