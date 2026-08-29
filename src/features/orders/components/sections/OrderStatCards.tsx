import { ArrowDown, ArrowUp } from "@solar-icons/react"
import { useQuery } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { buildOrderStatTiles } from "@/features/orders/logic/order-stat-tiles"
import type { OrderStatTrendTone } from "@/features/orders/logic/order-stat-tiles"
import { orderStatsQueryOptions } from "@/features/orders/api/options"
import { cn } from "@/lib/utils"

const trendToneClassName: Record<OrderStatTrendTone, string> = {
  positive: "text-success",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

// Six across only from 2xl up — a 200px card cannot hold a value like
// "125.000.000.000 VND".
const gridClassName =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"

// Route loader only prefetches this (see manage_/orders.tsx) — it doesn't
// block the route, so this component reads it itself via a plain useQuery
// instead of useSuspenseQuery.
export function OrderStatCards() {
  const statsQuery = useQuery(orderStatsQueryOptions())

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} size="sm">
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Stats are a secondary block on this page — a failed fetch hides the row
  // rather than replacing the whole page with an error screen.
  if (statsQuery.isError) {
    return null
  }

  const tiles = buildOrderStatTiles(statsQuery.data)

  return (
    <div className={gridClassName}>
      {tiles.map((tile) => (
        <Card key={tile.label} size="sm">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg",
                  tile.iconClassName
                )}
              >
                <tile.icon className="size-4" />
              </div>
              <p className="truncate text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {tile.label}
              </p>
            </div>

            <p className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "truncate font-bold text-foreground",
                  tile.valueSizeClassName
                )}
              >
                {tile.value}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {tile.unit}
              </span>
            </p>

            {/* No fallback text: a missing comparison renders nothing rather
                than an em-dash pretending to be data. */}
            {tile.trend ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  trendToneClassName[tile.trend.tone]
                )}
              >
                {tile.trend.direction ? (
                  tile.trend.direction === "up" ? (
                    <ArrowUp className="size-3 shrink-0" />
                  ) : (
                    <ArrowDown className="size-3 shrink-0" />
                  )
                ) : null}
                <span className="truncate">{tile.trend.text}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
