import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { Eye, ImageOff } from "lucide-react"

import { IconButton } from "@/components/shared/IconButton"
import { InventoryMaterialStatusBadge } from "@/features/inventory-materials/components/InventoryMaterialStatusBadge"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type { InventoryMaterial } from "@/lib/types/inventory-material.type"

const stockFormatter = new Intl.NumberFormat("vi-VN")

const inventoryColumnHelper = createColumnHelper<InventoryMaterial>()

// Highlight usable stock value: green when positive, red when negative.
function UsableStockCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        value < 0 ? "text-destructive" : "text-success"
      )}
    >
      {stockFormatter.format(value)}
    </span>
  )
}

export const inventoryMaterialColumns = [
  inventoryColumnHelper.display({
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
    meta: {
      headerClassName: "w-12 text-center",
      cellClassName: "text-center text-muted-foreground",
    },
  }),

  // Combined identity: thumbnail + tên + mã
  inventoryColumnHelper.display({
    id: "material",
    header: "Vật tư",
    meta: { headerClassName: "min-w-64" },
    cell: ({ row }) => {
      const item = row.original
      const imageUrl = item.image ? resolveFileUrl(item.image.url) : null

      return (
        <div className="flex min-w-0 items-center gap-3 py-1">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.name}
                layout="fullWidth"
                objectFit="cover"
                className="size-full"
              />
            ) : (
              <ImageOff className="size-4 text-muted-foreground/50" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {item.name}
            </p>
            <p className="truncate font-mono text-[11px] text-primary">
              {item.code}
            </p>
          </div>
        </div>
      )
    },
  }),

  inventoryColumnHelper.accessor((row) => row.unit.name, {
    id: "unit",
    header: "ĐVT",
    meta: { headerClassName: "min-w-16" },
  }),

  inventoryColumnHelper.accessor((row) => row.group.name, {
    id: "group",
    header: "Nhóm vật tư",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),

  inventoryColumnHelper.accessor("stockActual", {
    header: "Tồn thực tế",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right font-medium text-foreground tabular-nums",
    },
    cell: ({ getValue }) => stockFormatter.format(getValue()),
  }),

  inventoryColumnHelper.accessor("stockHeld", {
    header: "Đã giữ",
    meta: {
      headerClassName: "min-w-24 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => stockFormatter.format(getValue()),
  }),

  inventoryColumnHelper.accessor("stockAvailable", {
    header: "Có thể xuất",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums font-medium text-foreground",
    },
    cell: ({ getValue }) => stockFormatter.format(getValue()),
  }),

  inventoryColumnHelper.accessor("demandBom", {
    header: "Nhu cầu BOM",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => stockFormatter.format(getValue()),
  }),

  inventoryColumnHelper.accessor("stockUsable", {
    header: "Tồn khả dụng",
    meta: {
      headerClassName: "min-w-28 text-right",
      cellClassName: "text-right",
    },
    cell: ({ getValue }) => <UsableStockCell value={getValue()} />,
  }),

  inventoryColumnHelper.accessor("minStock", {
    header: "Min",
    meta: {
      headerClassName: "min-w-20 text-right",
      cellClassName: "text-right tabular-nums text-muted-foreground",
    },
    cell: ({ getValue }) => stockFormatter.format(getValue()),
  }),

  inventoryColumnHelper.accessor("status", {
    header: "Trạng thái",
    meta: {
      headerClassName: "min-w-28 text-center",
      cellClassName: "text-center",
    },
    cell: ({ getValue }) => (
      <InventoryMaterialStatusBadge status={getValue()} />
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
        <IconButton
          label="Xem chi tiết"
          className="text-muted-foreground hover:border-primary/30 hover:text-primary"
        >
          <Eye className="size-3.5" />
        </IconButton>
      </div>
    ),
  }),
]
