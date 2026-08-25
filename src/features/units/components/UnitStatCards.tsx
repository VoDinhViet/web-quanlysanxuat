import { Combine, Ruler } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import type { LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { unitScopeStyles } from "@/features/units/components/UnitBadges"
import { unitsQueryOptions } from "@/features/units/api/options"
import type { UnitDetail } from "@/lib/types/unit.type"
import { cn } from "@/lib/utils"

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  maximumFractionDigits: 0,
})

function formatShare(count: number, total: number): string {
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

function buildStatTiles(rows: UnitDetail[]): StatTile[] {
  const total = rows.length
  const materialCount = rows.filter((unit) =>
    unit.scopes.includes("MATERIAL")
  ).length
  const productCount = rows.filter((unit) =>
    unit.scopes.includes("PRODUCT")
  ).length
  const sharedCount = rows.filter(
    (unit) =>
      unit.scopes.includes("MATERIAL") && unit.scopes.includes("PRODUCT")
  ).length

  return [
    {
      label: "Tổng đơn vị tính",
      value: total,
      subtitle: "Tất cả",
      icon: Ruler,
      iconClassName: "bg-muted text-foreground",
    },
    {
      label: "Dùng cho vật tư",
      value: materialCount,
      subtitle: formatShare(materialCount, total),
      icon: unitScopeStyles.MATERIAL.icon,
      iconClassName: "bg-info/15 text-info",
    },
    {
      label: "Dùng cho sản phẩm",
      value: productCount,
      subtitle: formatShare(productCount, total),
      icon: unitScopeStyles.PRODUCT.icon,
      iconClassName: "bg-primary/15 text-primary",
    },
    {
      label: "Dùng chung cả hai",
      value: sharedCount,
      subtitle: formatShare(sharedCount, total),
      icon: Combine,
      iconClassName: "bg-success/15 text-success",
    },
  ]
}

const gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"

// Reads the unfiltered catalog independently of the page's own search/scope filter, so the
// overview always reflects the whole danh mục — not just what's currently filtered in the grid
// below. The route loader prefetches this (see manage_/units.tsx), so it resolves off cache on
// first paint; a filter/search change on the page never refetches it.
export function UnitStatCards() {
  const statsQuery = useQuery(unitsQueryOptions({}))

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card"
          >
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Stats are a secondary block on this page — a failed fetch hides the row
  // rather than replacing the whole page with an error screen.
  if (statsQuery.isError) {
    return null
  }

  const tiles = buildStatTiles(statsQuery.data)

  return (
    <div className={gridClassName}>
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
            <tile.icon className="size-5" />
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
