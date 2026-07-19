import { Boxes, CircleCheck, CircleSlash, Layers } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { ProductStats } from "@/features/products/types/product.type"
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

function buildStatTiles(stats: ProductStats): StatTile[] {
  return [
    {
      label: "Tổng sản phẩm",
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
      label: "Ngừng sử dụng",
      value: stats.inactive,
      subtitle: `${formatPercent(stats.inactive, stats.total)} danh mục`,
      icon: CircleSlash,
      iconClassName: "bg-slate-100 text-slate-600",
      accentClassName: "before:bg-slate-400",
    },
    {
      label: "Nhóm sản phẩm",
      value: stats.groupCount,
      subtitle: "Phân loại sản phẩm",
      icon: Layers,
      iconClassName: "bg-violet-100 text-violet-700",
      accentClassName: "before:bg-violet-500",
    },
  ]
}

type ProductStatCardsProps = {
  stats: ProductStats
}

export function ProductStatCards({ stats }: ProductStatCardsProps) {
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
