import { useQuery } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { iqcStatsQueryOptions } from "@/features/iqc/api/options"
import { buildIqcStatTiles } from "@/features/iqc/components/iqc-stat-tiles"
import { cn } from "@/lib/utils"

// Six across only from 2xl up — a narrower card cannot hold the icon tile + 2-line label/value
// stack side by side.
const gridClassName =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"

// Route loader only prefetches this (see manage_/iqc.tsx) — it doesn't block the route, so this
// component reads it itself via a plain useQuery instead of useSuspenseQuery.
export function IqcStatCards() {
  const statsQuery = useQuery(iqcStatsQueryOptions())

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg bg-card p-4 shadow-card"
          >
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Stats are a secondary block on this page — a failed fetch hides the row rather than
  // replacing the whole page with an error screen.
  if (statsQuery.isError) {
    return null
  }

  const tiles = buildIqcStatTiles(statsQuery.data)

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
            <p className="text-2xl font-bold text-foreground">
              {tile.value}
              {tile.percent && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({tile.percent})
                </span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
