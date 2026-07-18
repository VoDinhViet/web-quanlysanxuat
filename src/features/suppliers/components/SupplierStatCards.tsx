import type { LucideIcon } from "lucide-react"
import { Building2, CheckCircle2, PauseCircle, XCircle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { SupplierStats } from "@/features/suppliers/types/supplier.type"
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
  icon: LucideIcon
  iconClassName: string
}

function buildStatTiles(stats: SupplierStats): StatTile[] {
  return [
    {
      label: "Tổng nhà cung cấp",
      value: stats.total,
      subtitle: "Tất cả",
      icon: Building2,
      iconClassName: "bg-blue-100 text-blue-700",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      subtitle: formatPercent(stats.active, stats.total),
      icon: CheckCircle2,
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Tạm ngưng",
      value: stats.paused,
      subtitle: formatPercent(stats.paused, stats.total),
      icon: PauseCircle,
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      label: "Đã ngừng hợp tác",
      value: stats.stopped,
      subtitle: formatPercent(stats.stopped, stats.total),
      icon: XCircle,
      iconClassName: "bg-red-100 text-red-700",
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
        <Card key={tile.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full",
                tile.iconClassName
              )}
            >
              <tile.icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                {tile.label}
              </p>
              <p className="text-2xl font-semibold text-foreground">
                {tile.value}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {tile.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
