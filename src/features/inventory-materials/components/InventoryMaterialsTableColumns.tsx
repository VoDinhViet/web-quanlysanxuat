import { createColumnHelper } from "@tanstack/react-table"
import { Image } from "@unpic/react"
import { Eye, ImageOff } from "lucide-react"

import { IconButton } from "@/components/shared/IconButton"
import { InventoryMaterialStatusBadge } from "@/features/inventory-materials/components/InventoryMaterialStatusBadge"
import { resolveFileUrl } from "@/lib/file-url"
import { cn } from "@/lib/utils"
import type {
  InventoryStatus,
  MaterialInventoryItem,
} from "@/lib/types/inventory-material.type"

const stockFormatter = new Intl.NumberFormat("vi-VN")

const inventoryColumnHelper = createColumnHelper<MaterialInventoryItem>()

const stockValueClassName: Record<InventoryStatus, string> = {
  NORMAL: "text-foreground",
  WARNING: "text-warning",
  SHORTAGE: "text-destructive",
}

const gaugeFillClassName: Record<InventoryStatus, string> = {
  NORMAL: "bg-success",
  WARNING: "bg-warning",
  SHORTAGE: "bg-destructive",
}

type StockLevelGaugeProps = {
  available: number
  minStock: number
  status: InventoryStatus
}

// A per-row "fuel gauge": fill = available, tick = the reorder threshold
// (minStock). The domain is derived from this row's own numbers only (no
// cross-row scale), so every gauge reads its own margin-to-reorder at a
// glance instead of making the reader compare five raw columns.
function StockLevelGauge({
  available,
  minStock,
  status,
}: StockLevelGaugeProps) {
  const domainMax = Math.max(minStock * 1.5, available, 1)
  const fillPercent = Math.min(Math.max((available / domainMax) * 100, 0), 100)
  const tickPercent =
    minStock > 0 ? Math.min((minStock / domainMax) * 100, 100) : null

  return (
    <div
      className={cn(
        "relative h-1.5 w-full min-w-24 overflow-hidden rounded-full",
        status === "SHORTAGE" ? "bg-destructive/15" : "bg-muted"
      )}
    >
      <div
        className={cn("h-full rounded-full", gaugeFillClassName[status])}
        style={{ width: `${fillPercent}%` }}
      />
      {tickPercent !== null && (
        <span
          className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-foreground/30"
          style={{ left: `${tickPercent}%` }}
        />
      )}
    </div>
  )
}

type StockCellProps = {
  onHand: number
  reserved: number
  bomDemand: number
  available: number
  minStock: number
  status: InventoryStatus
}

// Collapses onHand/reserved/bomDemand/available/minStock into one glanceable
// cell: the number that actually drives `status` (available) stays big and
// colored, minStock rides along as the gauge's threshold, and onHand/reserved/
// bomDemand fall back to a compact caption — `issuable` (= onHand − reserved)
// is left out of the caption since it's arithmetically implied by the two
// numbers already shown there.
function StockCell({
  onHand,
  reserved,
  bomDemand,
  available,
  minStock,
  status,
}: StockCellProps) {
  return (
    <div className="flex min-w-40 flex-col gap-1 py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            stockValueClassName[status]
          )}
        >
          {stockFormatter.format(available)}
        </span>
        <span className="text-[10px] whitespace-nowrap text-muted-foreground">
          Min {stockFormatter.format(minStock)}
        </span>
      </div>
      <StockLevelGauge
        available={available}
        minStock={minStock}
        status={status}
      />
      <p className="truncate text-[10px] text-muted-foreground">
        Thực tồn {stockFormatter.format(onHand)} · Đã giữ{" "}
        {stockFormatter.format(reserved)} · BOM{" "}
        {stockFormatter.format(bomDemand)}
      </p>
    </div>
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

  inventoryColumnHelper.accessor((row) => row.supplier?.name, {
    id: "supplier",
    header: "Nhà cung cấp",
    meta: { headerClassName: "min-w-32" },
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() ?? "—"}</span>
    ),
  }),

  inventoryColumnHelper.display({
    id: "stock",
    header: "Tồn khả dụng",
    meta: { headerClassName: "min-w-44" },
    cell: ({ row }) => {
      const item = row.original
      return (
        <StockCell
          onHand={item.onHand}
          reserved={item.reserved}
          bomDemand={item.bomDemand}
          available={item.available}
          minStock={item.minStock}
          status={item.status}
        />
      )
    },
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
