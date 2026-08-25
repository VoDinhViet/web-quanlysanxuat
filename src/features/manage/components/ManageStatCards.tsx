import { useQuery } from "@tanstack/react-query"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { reportStatsQueryOptions } from "@/features/reports/api"
import {
  buildReportStatsTiles,
  getTrendIcon,
} from "@/features/manage/components/report-stats-tiles"
import { cn } from "@/lib/utils"

const gridClassName =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"

// Route loader only prefetches this (see routes/(authed)/manage.tsx) — it doesn't block the
// route, so this component reads it itself via a plain useQuery instead of useSuspenseQuery.
export function ManageStatCards() {
  const statsQuery = useQuery(reportStatsQueryOptions())

  if (statsQuery.isPending) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} size="sm">
            <CardContent className="flex items-start gap-3">
              <Skeleton className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Stats are a secondary block on this page — a failed fetch hides the row rather than
  // replacing the whole page with an error screen.
  if (statsQuery.isError) {
    return null
  }

  const tiles = buildReportStatsTiles(statsQuery.data)

  return (
    <div className={gridClassName}>
      {tiles.map((stat) => {
        const TrendIcon = getTrendIcon(stat.trend?.direction)

        return (
          <Card key={stat.label} size="sm">
            <CardContent className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  stat.iconClassName
                )}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground uppercase">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {stat.unit}
                  </span>
                </p>
                {stat.trend ? (
                  <p
                    className={cn(
                      "flex items-center gap-1 text-[11px]",
                      stat.trend.direction === "up" && "text-success",
                      stat.trend.direction === "down" && "text-destructive",
                      !stat.trend.direction && "text-muted-foreground"
                    )}
                  >
                    {TrendIcon && <TrendIcon className="size-3" />}
                    {stat.trend.text}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
