import { Boxes, CircleCheck, Factory, UserRound } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { MaterialStats } from "@/features/materials/types/material.type"
import { cn } from "@/lib/utils"

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
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
  accentClassName: string
}

function buildStatTiles(stats: MaterialStats): StatTile[] {
  return [
    {
      label: "Tổng vật tư",
      value: stats.total,
      subtitle: "Toàn bộ danh mục",
      icon: Boxes,
      iconClassName: "bg-blue-100 text-blue-700",
      accentClassName: "before:bg-blue-500",
    },
    {
      label: "Đang sử dụng",
      value: stats.active,
      subtitle: `${formatPercent(stats.active, stats.total)} danh mục`,
      icon: CircleCheck,
      iconClassName: "bg-emerald-100 text-emerald-700",
      accentClassName: "before:bg-emerald-500",
    },
    {
      label: "Vật tư nội bộ",
      value: stats.internal,
      subtitle: `${formatPercent(stats.internal, stats.total)} danh mục`,
      icon: Factory,
      iconClassName: "bg-indigo-100 text-indigo-700",
      accentClassName: "before:bg-indigo-500",
    },
    {
      label: "Vật tư khách hàng",
      value: stats.client,
      subtitle: `${formatPercent(stats.client, stats.total)} danh mục`,
      icon: UserRound,
      iconClassName: "bg-sky-100 text-sky-700",
      accentClassName: "before:bg-sky-500",
    },
  ]
}

type MaterialStatCardsProps = {
  stats: MaterialStats
}

export function MaterialStatCards({ stats }: MaterialStatCardsProps) {
  const tiles = buildStatTiles(stats)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Card
          key={tile.label}
          size="sm"
          className={cn(
            "relative pl-1 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:content-['']",
            tile.accentClassName
          )}
        >
          <CardContent className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
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
