import { Icon } from "@iconify/react"
import buildings2Bold from "@iconify-icons/solar/buildings-2-bold"
import checkCircleBold from "@iconify-icons/solar/check-circle-bold"
import closeCircleBold from "@iconify-icons/solar/close-circle-bold"
import pauseCircleBold from "@iconify-icons/solar/pause-circle-bold"
import type { IconifyIcon } from "@iconify/types"

import type { SupplierStats } from "@/lib/types/supplier.type"
import { cn } from "@/lib/utils"

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPercent(count: number, total: number): string {
  if (total === 0) return "0%"

  return percentFormatter.format(count / total)
}

type StatTile = {
  label: string
  value: number
  subtitle: string
  icon: IconifyIcon
  iconClassName: string
}

function buildStatTiles(stats: SupplierStats): StatTile[] {
  return [
    {
      label: "Tổng nhà cung cấp",
      value: stats.total,
      subtitle: "Tất cả",
      icon: buildings2Bold,
      iconClassName: "bg-info/15 text-info",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      subtitle: formatPercent(stats.active, stats.total),
      icon: checkCircleBold,
      iconClassName: "bg-success/15 text-success",
    },
    {
      label: "Tạm ngưng",
      value: stats.paused,
      subtitle: formatPercent(stats.paused, stats.total),
      icon: pauseCircleBold,
      iconClassName: "bg-warning/15 text-warning",
    },
    {
      label: "Đã ngừng hợp tác",
      value: stats.stopped,
      subtitle: formatPercent(stats.stopped, stats.total),
      icon: closeCircleBold,
      iconClassName: "bg-destructive/15 text-destructive",
    },
  ]
}

type SupplierStatCardsProps = {
  stats: SupplierStats
}

export function SupplierStatCards({ stats }: SupplierStatCardsProps) {
  const tiles = buildStatTiles(stats)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card"
        >
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              tile.iconClassName
            )}
          >
            <Icon icon={tile.icon} className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-muted-foreground">
              {tile.label}
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {tile.value}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              {tile.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
