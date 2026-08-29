import {
  Buildings2,
  CheckCircle,
  CloseCircle,
  PauseCircle,
} from "@solar-icons/react"
import { useQuery } from "@tanstack/react-query"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { supplierStatsQueryOptions } from "@/features/suppliers/api/options"
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
  icon: ComponentType<IconProps>
  iconClassName: string
}

function buildStatTiles(stats: SupplierStats): StatTile[] {
  return [
    {
      label: "Tổng nhà cung cấp",
      value: stats.total,
      subtitle: "Tất cả",
      icon: Buildings2,
      iconClassName: "bg-info/15 text-info",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      subtitle: formatPercent(stats.active, stats.total),
      icon: CheckCircle,
      iconClassName: "bg-success/15 text-success",
    },
    {
      label: "Tạm ngưng",
      value: stats.paused,
      subtitle: formatPercent(stats.paused, stats.total),
      icon: PauseCircle,
      iconClassName: "bg-warning/15 text-warning",
    },
    {
      label: "Đã ngừng hợp tác",
      value: stats.stopped,
      subtitle: formatPercent(stats.stopped, stats.total),
      icon: CloseCircle,
      iconClassName: "bg-destructive/15 text-destructive",
    },
  ]
}

const gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"

// Route loader only prefetches this (see manage_/suppliers.tsx) — it doesn't
// block the route, so this component reads it itself via a plain useQuery
// instead of useSuspenseQuery.
export function SupplierStatCards() {
  const statsQuery = useQuery(supplierStatsQueryOptions())

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
