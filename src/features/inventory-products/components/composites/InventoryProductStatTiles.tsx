import { Box, CheckCircle, Lock, Refresh, Target } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { UseQueryResult } from "@tanstack/react-query"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { IconButton } from "@/components/shared/primitives/IconButton"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"
import { cn } from "@/lib/utils"

const quantityFormatter = new Intl.NumberFormat("vi-VN")

type StatTile = {
  icon: ComponentType<IconProps>
  label: string
  value: string
  toneClassName: string
}

type InventoryProductStatTilesProps = {
  inventory: ProductInventoryItem
  query: Pick<UseQueryResult, "dataUpdatedAt" | "refetch" | "isFetching">
}

// "TỔNG QUAN TỒN KHO" — 4 flat tinted tiles, same StatTile/grid shape as
// OrderDetailStatTiles.tsx, populated from the 4 real fields ProductInventoryItem already
// carries. The mockup's 4th tile read "Tổng nhu cầu PO"; relabeled here to "Nhu cầu PO chưa giữ"
// to state what `bomDemand` actually means ("nhu cầu đơn hàng mở chưa có DO nào giữ") — the
// mockup's number didn't correspond to any one real field.
export function InventoryProductStatTiles({
  inventory,
  query,
}: InventoryProductStatTilesProps) {
  const tiles: StatTile[] = [
    {
      icon: Box,
      label: "Tồn thực tế",
      value: `${quantityFormatter.format(inventory.onHand)} ${inventory.unit.name}`,
      toneClassName: "text-info",
    },
    {
      icon: Lock,
      label: "Đã giữ",
      value: `${quantityFormatter.format(inventory.reserved)} ${inventory.unit.name}`,
      toneClassName: "text-warning",
    },
    {
      icon: CheckCircle,
      label: "Có thể xuất",
      value: `${quantityFormatter.format(inventory.available)} ${inventory.unit.name}`,
      toneClassName:
        inventory.available < 0 ? "text-destructive" : "text-success",
    },
    {
      icon: Target,
      label: "Nhu cầu chưa giữ",
      value: `${quantityFormatter.format(inventory.bomDemand)} ${inventory.unit.name}`,
      toneClassName: "text-foreground",
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        Tổng quan tồn kho
      </p>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border/60">
        {tiles.map((tile, index) => (
          <div
            key={tile.label}
            className={cn(
              "p-3",
              index % 2 === 0 && "border-r border-border/60",
              index < 2 && "border-b border-border/60"
            )}
          >
            <div className="flex items-center gap-1.5">
              <tile.icon
                className={cn("size-3.5 shrink-0", tile.toneClassName)}
              />
              <p className="truncate text-[10px] leading-tight font-semibold tracking-wide text-muted-foreground uppercase">
                {tile.label}
              </p>
            </div>
            <p
              className={cn(
                "mt-1 truncate text-lg font-bold tabular-nums",
                tile.toneClassName
              )}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
        <span>
          Cập nhật đến{" "}
          {DateTime.fromMillis(query.dataUpdatedAt).toFormat(
            "HH:mm · dd/MM/yyyy"
          )}
        </span>
        <IconButton
          label="Làm mới"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="size-6 border-none text-muted-foreground hover:text-foreground"
        >
          <Refresh
            className={cn("size-3.5", query.isFetching && "animate-spin")}
          />
        </IconButton>
      </div>
    </div>
  )
}
